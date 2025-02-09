import { SyncWorkoutsPayload } from "@/api/workout";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import pMap from "p-map";

export const POST = async (req: NextRequest) => {
  const body = (await req.json()) as SyncWorkoutsPayload;
  try {
    const unsynced = body.unsynced;
    const updatedList: Array<{ localId: number; serverId: string }> = [];
    await pMap(
      unsynced,
      async (workout) => {
        const id = workout.serverId;

        if (id && workout.id) {
          updatedList.push({ localId: workout.id, serverId: id });
        } else {
          const newWorkout = await prisma.workout.create({
            data: {
              userId: workout.userId,
              createdAt: workout.createdAt,
              date: new Date(workout.date),
            },
          });
          if (workout.id) {
            updatedList.push({ localId: workout.id, serverId: newWorkout.id });
          }
        }
      },
      { concurrency: 5 }
    );

    return NextResponse.json({ success: true, updated: updatedList });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
};
