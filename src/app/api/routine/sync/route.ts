import pMap from "p-map";
import { localRoutineSchema } from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest } from "next/server";
import { z } from "zod";

const requestBodySchema = z.object({
  unsynced: z.array(localRoutineSchema),
});

type RequestBody = z.infer<typeof requestBodySchema>;

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsedBody = validateData(requestBodySchema, body);
    const unsynced = parsedBody.unsynced;
    const updatedList: Array<{ localId: number; serverId: string }> = [];
    await pMap(unsynced, async (routine) => {
      const id = routine.serverId;
      if (id && routine.id) {
        updatedList.push({ localId: routine.id, serverId: id });
      }
    });
  } catch (e) {}
};
