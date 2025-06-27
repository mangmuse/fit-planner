import { SyncWorkoutDetailsToServerResponse } from "@/api/workoutDetail.api";
import { handleServerError, HttpError } from "@/app/api/_utils/handleError";
import { prisma } from "@/lib/prisma";
import {
  LocalWorkoutDetail,
  LocalWorkoutDetailWithServerWorkoutId,
  localWorkoutDetailSchema,
} from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";
import pMap from "p-map";
import { z } from "zod";

const requestBodySchema = z.object({
  mappedUnsynced: z.array(
    localWorkoutDetailSchema.extend({
      workoutId: z.string(),
      id: z.number(),
    })
  ),
});

type RequestBody = z.infer<typeof requestBodySchema>;

const createWorkoutDetail = async (
  detail: LocalWorkoutDetailWithServerWorkoutId
) => {
  const workout = await prisma.workout.findUnique({
    where: { id: detail.workoutId },
  });
  if (!workout)
    throw new HttpError("WorkoutId가 일치하는 workout을 찾지 못했습니다", 404);

  const created = await prisma.workoutDetail.create({
    data: {
      weight: detail.weight,
      rpe: detail.rpe,
      reps: detail.reps,
      setOrder: detail.setOrder,
      isDone: detail.isDone,
      setType: detail.setType,
      exerciseOrder: detail.exerciseOrder,
      workout: { connect: { id: detail.workoutId } },
      exercise: { connect: { id: detail.exerciseId } },
    },
  });
  return created;
};

const updateWorkoutDetail = async (
  detail: LocalWorkoutDetailWithServerWorkoutId,
  serverId: string
) => {
  const updated = await prisma.workoutDetail.update({
    where: { id: serverId },
    data: {
      weight: detail.weight,
      rpe: detail.rpe,
      reps: detail.reps,
      setOrder: detail.setOrder,
      isDone: detail.isDone,
      setType: detail.setType,
      exerciseOrder: detail.exerciseOrder,
    },
  });
  return updated;
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsedBody = validateData<RequestBody>(requestBodySchema, body);

    const unsynced = parsedBody.mappedUnsynced;

    const updatedList: SyncWorkoutDetailsToServerResponse["updated"] =
      await pMap(
        unsynced,
        async (detail) => {
          let serverDetailId = detail.serverId;
          if (serverDetailId) {
            const updated = await updateWorkoutDetail(detail, serverDetailId);
            serverDetailId = updated.id;
          } else {
            const created = await createWorkoutDetail(detail);
            serverDetailId = created.id;
          }
          return {
            localId: detail.id,
            serverId: serverDetailId,
            exerciseId: detail.exerciseId,
            workoutId: detail.workoutId,
          };
        },
        { concurrency: 5 }
      );

    return NextResponse.json({ success: true, updated: updatedList });
  } catch (e) {
    return handleServerError(e);
  }
};
