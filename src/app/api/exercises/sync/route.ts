import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import pMap from "p-map";
import { Exercise } from "@prisma/client";
import { validateData } from "@/util/validateData";
import { z } from "zod";

const requestBodySchema = z.object({
  unsynced: z.array(
    z.object({
      imageUrl: z.string(),
      createdAt: z.string(),
      isCustom: z.boolean(),
      isBookmarked: z.boolean(),
      name: z.string(),
      category: z.string(),
      serverId: z.number().nullable(),
      id: z.number().optional(),
      isSynced: z.boolean(),
      userId: z.string(),
    })
  ),
  userId: z.string(),
});

type RequestBody = z.infer<typeof requestBodySchema>;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
        console.log(serverExerciseId);

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
          if (!exercise) throw new Error("");
          serverExerciseId = exercise.id;
          updatedList.push({ localId, serverId: serverExerciseId });
        }

        if (userId && serverExerciseId) {
          await prisma.userExercise.upsert({
            where: {
              userId_exerciseId: {
                userId,
                exerciseId: serverExerciseId,
              },
            },
            update: { isBookmarked },
            create: {
              userId,
              exerciseId: serverExerciseId,
              isBookmarked,
            },
          });
        }
      },
      { concurrency: 5 }
    );

    return NextResponse.json(
      { success: true, updated: updatedList },
      { status: 201 }
    );
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ success: false, message: err }, { status: 500 });
  }
}
