import { handleServerError } from "@/app/api/_utils/handleError";
import { prisma } from "@/lib/prisma";
import { LocalWorkout, localWorkoutSchema } from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";
import pMap from "p-map";
import { z } from "zod";

const requestBodySchema = z.object({
  unsynced: z.array(localWorkoutSchema),
});

type RequestBody = z.infer<typeof requestBodySchema>;

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsedBody = validateData<RequestBody>(requestBodySchema, body);
    const unsynced = parsedBody.unsynced;
    const updatedList: Array<{ localId: number; serverId: string }> = [];
    await pMap(
      unsynced,
      async (workout) => {
        const workoutRecord = await prisma.workout.upsert({
          where: {
            userId_date: {
              userId: workout.userId,
              date: new Date(workout.date),
            },
          },
          update: {
            status: workout.status,
            updatedAt: workout.updatedAt,
          },
          create: {
            userId: workout.userId,
            createdAt: workout.createdAt,
            status: workout.status,
            date: new Date(workout.date),
          },
        });
        if (workout.id) {
          updatedList.push({
            localId: workout.id,
            serverId: workoutRecord.id,
          });
        }
      },
      { concurrency: 5 }
    );

    return NextResponse.json({
      success: true,
      updated: updatedList,
    });
  } catch (e) {
    return handleServerError(e);
  }
};
