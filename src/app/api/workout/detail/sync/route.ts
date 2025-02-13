import { SyncWorkoutDetailsToServerResponse } from "@/api/workoutDetail.api";
import { handleServerError, HttpError } from "@/app/api/_utils/handleError";
import { prisma } from "@/lib/prisma";
import { localWorkoutDetailSchema } from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";
import pMap from "p-map";
import { z } from "zod";

const requestBodySchema = z.object({
  mappedUnsynced: z.array(
    localWorkoutDetailSchema.extend({
      workoutId: z.string(),
    })
  ),
});

type RequestBody = z.infer<typeof requestBodySchema>;

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsedBody = validateData<RequestBody>(requestBodySchema, body);

    const unsynced = parsedBody.mappedUnsynced;

    const updatedList: SyncWorkoutDetailsToServerResponse["updated"] = [];
    await pMap(
      unsynced,
      async (detail) => {
        const localId = detail.id;

        if (!localId) throw new HttpError("localId가 없습니다", 422);

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
          const workout = await prisma.workout.findUnique({
            where: { id: workoutId },
          });
          if (!workout) {
            throw new HttpError(
              `workoutId가 일치하는 workout을 찾지 못했습니다`,
              404
            );
          }

          const created = await prisma.workoutDetail.upsert({
            where: {
              workoutId_exerciseOrder_setOrder: {
                workoutId: workout.id,
                exerciseOrder: detail.exerciseOrder,
                setOrder: detail.setOrder,
              },
            },
            update: {
              ...detailInput,
            },
            create: {
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
    return handleServerError(e);
  }
};
