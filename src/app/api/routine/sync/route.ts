import { create } from "zustand";
import pMap from "p-map";
import { localRoutineSchema } from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleServerError } from "@/app/api/_utils/handleError";

const requestBodySchema = z.object({
  unsynced: z.array(localRoutineSchema),
});

type RequestBody = z.infer<typeof requestBodySchema>;

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsedBody = validateData<RequestBody>(requestBodySchema, body);
    const unsynced = parsedBody.unsynced;
    console.log(unsynced, "unsyncedunsyncedunsynced");
    const updatedList: Array<{ localId: number; serverId: string }> = [];
    await pMap(
      unsynced,
      async (routine) => {
        let routineRecord;
        if (routine.serverId) {
          const updatedRecord = await prisma.routine.update({
            where: {
              id: routine.serverId,
            },
            data: {
              name: routine.name,
              description: routine.description || "",
              updatedAt: routine.updatedAt,
            },
          });
          if (routine.id) {
            updatedList.push({
              localId: routine.id,
              serverId: updatedRecord.id,
            });
          }
        } else {
          const createdRecord = await prisma.routine.create({
            data: {
              userId: routine.userId,
              name: routine.name,
              description: routine.description || "",
              createdAt: routine.createdAt,
            },
          });
          if (routine.id) {
            updatedList.push({
              localId: routine.id,
              serverId: createdRecord.id,
            });
          }
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
