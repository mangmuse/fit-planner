import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import pMap from "p-map";
import { Exercise } from "@prisma/client";
import { validateData } from "@/util/validateData";
import { z } from "zod";
import { handleServerError } from "@/app/api/_utils/handleError";
import { localExerciseSchema } from "@/types/models";

const requestBodySchema = z.object({
  unsynced: z.array(localExerciseSchema),
  userId: z.string(),
});

type RequestBody = z.infer<typeof requestBodySchema>;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body, "Received body in sync route");
    const parsedBody = validateData<RequestBody>(requestBodySchema, body);

    const unsynced = parsedBody.unsynced;

    const userId = parsedBody.userId;
    const updatedList: Array<{ localId: number; serverId: number }> = [];

    await pMap(
      unsynced,
      async (item) => {
        const localId = item.id ?? 0;
        let serverExerciseId = item.serverId;
        const isBookmarked = item.isBookmarked ?? false;

        let exercise: Exercise | null = null;
        if (serverExerciseId) {
          exercise = await prisma.exercise.findUnique({
            where: { id: serverExerciseId },
          });
        }
        if (!exercise) {
          exercise = await prisma.exercise.create({
            data: {
              name: item.name,
              category: item.category,
              isCustom: true,
              imageUrl: item.imageUrl,
              userId,
              createdAt: new Date(item.createdAt),
            },
          });
          serverExerciseId = exercise.id;
          updatedList.push({ localId, serverId: serverExerciseId });
        }

        if (userId && serverExerciseId) {
          const userExercise = await prisma.userExercise.upsert({
            where: {
              userId_exerciseId: {
                userId,
                exerciseId: serverExerciseId,
              },
            },
            update: {
              isBookmarked,
              unit: item.unit,
            },
            create: {
              userId,
              exerciseId: serverExerciseId,
              isBookmarked,
              unit: item.unit,
            },
          });

          // Fixed 메모 동기화 처리
          if (item.exerciseMemo?.fixed) {
            const fixedMemo = item.exerciseMemo.fixed;
            await prisma.fixedExerciseMemo.upsert({
              where: {
                userExerciseId: userExercise.id,
              },
              update: {
                content: fixedMemo.content,
                updatedAt: fixedMemo.updatedAt
                  ? new Date(fixedMemo.updatedAt)
                  : new Date(),
              },
              create: {
                userExerciseId: userExercise.id,
                content: fixedMemo.content,
                createdAt: new Date(fixedMemo.createdAt),
                updatedAt: fixedMemo.updatedAt
                  ? new Date(fixedMemo.updatedAt)
                  : null,
              },
            });
          }

          // Daily 메모 동기화 처리
          if (item.exerciseMemo?.daily && item.exerciseMemo.daily.length > 0) {
            // 기존 daily 메모들을 날짜별로 upsert
            await pMap(
              item.exerciseMemo.daily,
              async (dailyMemo) => {
                await prisma.dailyExerciseMemo.upsert({
                  where: {
                    userExerciseId_date: {
                      userExerciseId: userExercise.id,
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
                    userExerciseId: userExercise.id,
                    date: new Date(dailyMemo.date),
                    content: dailyMemo.content,
                    createdAt: new Date(dailyMemo.createdAt),
                    updatedAt: dailyMemo.updatedAt
                      ? new Date(dailyMemo.updatedAt)
                      : null,
                  },
                });
              },
              { concurrency: 3 } // daily 메모는 여러 개일 수 있으므로 동시성 제한
            );
          }
        }
      },
      { concurrency: 5 }
    );

    return NextResponse.json(
      { success: true, updated: updatedList },
      { status: 201 }
    );
  } catch (e) {
    return handleServerError(e);
  }
}
