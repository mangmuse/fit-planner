import { SyncWorkoutsPayload } from "@/api/workout";
import { SyncWorkoutDetailsPayload } from "@/api/workoutDetail";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import pMap from "p-map";

export const POST = async (req: NextRequest) => {
  const body = (await req.json()) as SyncWorkoutDetailsPayload;
  console.log(
    body,
    "asiokldfhjqwaiofhqwoifhiqwofhiwqofhiqwohoasiokldfhjqwaiofhqwoifhiqwofhiwqofhiqwohoasiokldfhjqwaiofhqwoifhiqwofhiwqofhiqwohoasiokldfhjqwaiofhqwoifhiqwofhiwqofhiqwohoasiokldfhjqwaiofhqwoifhiqwofhiwqofhiqwohoasiokldfhjqwaiofhqwoifhiqwofhiwqofhiqwohoasiokldfhjqwaiofhqwoifhiqwofhiwqofhiqwohoasiokldfhjqwaiofhqwoifhiqwofhiwqofhiqwoho"
  );

  try {
    const unsynced = body.mappedUnsynced;

    const updatedList: Array<{
      localId: number;
      serverId: string;
      exerciseId: number;
      workoutId: string;
    }> = [];
    await pMap(
      unsynced,
      async (detail) => {
        console.log(detail);
        const localId = detail.id;
        console.log(localId);
        if (!localId) throw new Error("localId가 없습니다");

        const {
          createdAt,
          updatedAt,
          id,
          isSynced,
          exerciseName,
          serverId,
          workoutId,
          exerciseId,
          ...detailInput
        } = detail;

        let serverDetailId = serverId;
        if (serverDetailId) {
          const updated = await prisma.workoutDetail.update({
            where: { id: serverDetailId },
            data: {
              ...detailInput,
            },
          });
          serverDetailId = updated.id;
        } else {
          console.log(
            workoutId,
            exerciseId,
            "workoutId,exerciseIdworkoutId,exerciseIdworkoutId,exerciseId"
          );

          const created = await prisma.workoutDetail.create({
            data: {
              ...detailInput,
              workout: { connect: { id: workoutId } },
              exercise: { connect: { id: exerciseId } },
            },
          });
          serverDetailId = created.id;
        }
        updatedList.push({
          localId,
          serverId: serverDetailId,
          exerciseId,
          workoutId,
        });
      },
      { concurrency: 5 }
    );

    return NextResponse.json({ success: true, updated: updatedList });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
};
