import pMap from "p-map";
import { SyncRoutineDetailsToServerResponse } from "@/api/routineDetail.api";
import { handleServerError, HttpError } from "@/app/api/_utils/handleError";
import { localRoutineDetailSchema } from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const requestBodySchema = z.object({
  mappedUnsynced: z.array(
    localRoutineDetailSchema.extend({
      routineId: z.string(),
    })
  ),
});

type RequestBody = z.infer<typeof requestBodySchema>;

export const POST = async (req: NextRequest) => {
  console.log("hellohellohellohellohellohellohellohellohellohellohello");
  try {
    const body = await req.json();
    console.log(body, "bodybodybodybodybodybody");
    const parsedBody = validateData<RequestBody>(requestBodySchema, body);
    console.log(parsedBody, "parsedBodyparsedBodyparsedBody");
    const unsynced = parsedBody.mappedUnsynced;
    const updatedList: SyncRoutineDetailsToServerResponse["updated"] = [];
    await pMap(
      unsynced,
      async (detail) => {
        const localId = detail.id;
        if (!localId) throw new HttpError("localId가 없습니다", 422);

        const {
          createdAt,
          exerciseId,
          exerciseName,
          isSynced,
          routineId,
          serverId,
          id,
          ...detailInput
        } = detail;
        let serverDetailId = serverId;
        if (serverDetailId) {
          const updated = await prisma.routineDetail.update({
            where: { id: serverDetailId },
            data: { ...detailInput },
          });
          serverDetailId = updated.id;
        } else {
          const routine = await prisma.routine.findUnique({
            where: { id: routineId },
          });
          if (!routine)
            throw new HttpError(
              "RoutineId가 일치하는 routine을 찾지 못했습니다",
              404
            );
          console.log(detail, "여기왔나요??????");
          const created = await prisma.routineDetail.create({
            data: {
              ...detailInput,
              routine: { connect: { id: routineId } },
              exercise: { connect: { id: exerciseId } },
            },
          });
          serverDetailId = created.id;
        }
        updatedList.push({
          localId,
          serverId: serverDetailId,
          exerciseId,
          routineId,
        });
      },
      { concurrency: 5 }
    );
    return NextResponse.json({ success: true, updated: updatedList });
  } catch (e) {
    return handleServerError(e);
  }
};
