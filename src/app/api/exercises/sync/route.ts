import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import pMap from "p-map";
import { Exercise, Prisma, UserExercise } from "@prisma/client";
import { validateData } from "@/util/validateData";
import { z } from "zod";
import { handleServerError } from "@/app/api/_utils/handleError";
import { localExerciseSchema } from "@/types/models";

type PrismaTx = Prisma.TransactionClient;
const requestBodySchema = z.object({
  unsynced: z.array(localExerciseSchema),
  userId: z.string(),
});

type RequestBody = z.infer<typeof requestBodySchema>;
type LocalExercise = z.infer<typeof localExerciseSchema>;
export type UpdatedListItem = { localId: number; serverId: number };

async function syncFixedMemo(
  tx: PrismaTx,
  userExerciseId: string,
  fixedMemoData?: {
    content: string;
    createdAt: string | Date;
    updatedAt?: string | Date | null;
  } | null
) {
  if (!fixedMemoData) return;

  await tx.fixedExerciseMemo.upsert({
    where: { userExerciseId },
    update: {
      content: fixedMemoData.content,
      updatedAt: fixedMemoData.updatedAt
        ? new Date(fixedMemoData.updatedAt)
        : new Date(),
    },
    create: {
      userExerciseId,
      content: fixedMemoData.content,
      createdAt: new Date(fixedMemoData.createdAt),
      updatedAt: fixedMemoData.updatedAt
        ? new Date(fixedMemoData.updatedAt)
        : null,
    },
  });
}

async function syncDailyMemos(
  tx: PrismaTx,
  userExerciseId: string,
  dailyMemosData?: Array<{
    date: string | Date;
    content: string;
    createdAt: string | Date;
    updatedAt?: string | Date | null;
  }> | null
) {
  if (!dailyMemosData || dailyMemosData.length === 0) return;

  await pMap(
    dailyMemosData,
    async (dailyMemo) => {
      await tx.dailyExerciseMemo.upsert({
        where: {
          userExerciseId_date: {
            userExerciseId,
            date: new Date(dailyMemo.date),
          },
        },
        update: {
          content: dailyMemo.content,
          updatedAt: dailyMemo.updatedAt
            ? new Date(dailyMemo.updatedAt)
            : new Date(),
        },
        create: {
          userExerciseId,
          date: new Date(dailyMemo.date),
          content: dailyMemo.content,
          createdAt: new Date(dailyMemo.createdAt),
          updatedAt: dailyMemo.updatedAt ? new Date(dailyMemo.updatedAt) : null,
        },
      });
    },
    { concurrency: 3 }
  );
}

async function ensureExerciseRecord(
  tx: PrismaTx,
  item: LocalExercise,
  userIdFromRequest: string
): Promise<{ exercise: Exercise; wasCreated: boolean }> {
  let exercise: Exercise | null = null;
  let wasCreated = false;

  const userIdForExerciseData = item.userId || userIdFromRequest;

  if (item.serverId) {
    exercise = await tx.exercise.findUnique({
      where: { id: item.serverId },
    });
  }

  if (!exercise) {
    exercise = await tx.exercise.create({
      data: {
        name: item.name,
        category: item.category,
        isCustom: item.isCustom,
        imageUrl: item.imageUrl,
        userId: userIdForExerciseData,
        createdAt: new Date(item.createdAt),
      },
    });
    wasCreated = true;
  }
  return { exercise: exercise!, wasCreated };
}

async function upsertUserExerciseRelation(
  tx: PrismaTx,
  requestUserId: string,
  exerciseId: number,
  itemDetails: { isBookmarked: boolean; unit: "kg" | "lbs" }
): Promise<UserExercise> {
  return tx.userExercise.upsert({
    where: {
      userId_exerciseId: {
        userId: requestUserId,
        exerciseId,
      },
    },
    update: {
      isBookmarked: itemDetails.isBookmarked,
      unit: itemDetails.unit,
    },
    create: {
      userId: requestUserId,
      exerciseId,
      isBookmarked: itemDetails.isBookmarked,
      unit: itemDetails.unit,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = validateData<RequestBody>(requestBodySchema, body);
    const { unsynced, userId: requestUserId } = parsedBody;

    if (unsynced.length === 0) {
      return NextResponse.json({ success: true, updated: [] }, { status: 200 });
    }

    const results = await pMap(
      unsynced,
      async (item: LocalExercise) => {
        return prisma.$transaction(async (tx) => {
          const { exercise, wasCreated } = await ensureExerciseRecord(
            tx,
            item,
            requestUserId
          );
          const serverExerciseId = exercise.id;

          const userExercise = await upsertUserExerciseRelation(
            tx,
            requestUserId,
            serverExerciseId,
            { isBookmarked: item.isBookmarked, unit: item.unit }
          );

          await syncFixedMemo(
            tx,
            userExercise.id.toString(),
            item.exerciseMemo?.fixed
          );
          await syncDailyMemos(
            tx,
            userExercise.id.toString(),
            item.exerciseMemo?.daily
          );

          return { localId: item.id, serverId: serverExerciseId };
        });
      },
      { concurrency: 5 }
    );

    return NextResponse.json(
      { success: true, updated: results },
      { status: 201 }
    );
  } catch (e) {
    return handleServerError(e);
  }
}
