import pMap from "p-map";
import { SyncRoutineDetailsToServerResponse } from "@/api/routineDetail.api";
import { handleServerError, HttpError } from "@/app/api/_utils/handleError";
import {
  localRoutineDetailSchema,
  LocalRoutineDetailWithServerRoutineId,
} from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const requestBodySchema = z.object({
  mappedUnsynced: z.array(
    localRoutineDetailSchema.extend({
      routineId: z.string(),
      id: z.number(),
    })
  ),
});

type RequestBody = z.infer<typeof requestBodySchema>;

const createRoutineDetail = async (
  detail: LocalRoutineDetailWithServerRoutineId
) => {
  const routine = await prisma.routine.findUnique({
    where: { id: detail.routineId },
  });
  if (!routine)
    throw new HttpError("RoutineId가 일치하는 routine을 찾지 못했습니다", 404);

  const created = await prisma.routineDetail.create({
    data: {
      weight: detail.weight,
      rpe: detail.rpe,
      reps: detail.reps,
      setOrder: detail.setOrder,
      setType: detail.setType,
      exerciseOrder: detail.exerciseOrder,
      routine: { connect: { id: detail.routineId } },
      exercise: { connect: { id: detail.exerciseId } },
    },
  });
  return created;
};

const updateRoutineDetail = async (
  detail: LocalRoutineDetailWithServerRoutineId,
  serverId: string
) => {
  const updated = await prisma.routineDetail.update({
    where: { id: serverId },
    data: {
      weight: detail.weight,
      rpe: detail.rpe,
      reps: detail.reps,
      setOrder: detail.setOrder,
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

    const updatedList: SyncRoutineDetailsToServerResponse["updated"] =
      await pMap(
        unsynced,
        async (detail) => {
          let serverDetailId = detail.serverId;
          if (serverDetailId) {
            const updated = await updateRoutineDetail(detail, serverDetailId);
            serverDetailId = updated.id;
          } else {
            const created = await createRoutineDetail(detail);
            serverDetailId = created.id;
          }
          return {
            localId: detail.id,
            serverId: serverDetailId,
            exerciseId: detail.exerciseId,
            routineId: detail.routineId,
          };
        },
        { concurrency: 5 }
      );

    return NextResponse.json({ success: true, updated: updatedList });
  } catch (e) {
    return handleServerError(e);
  }
};
