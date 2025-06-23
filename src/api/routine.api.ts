import { BASE_URL } from "@/constants";
import {
  FETCH_ROUTINES_ERROR,
  POST_ROUTINES_ERROR,
} from "@/constants/errorMessage";
import { IRoutineApi } from "@/types/apis";
import {
  ClientRoutine,
  clientRoutineSchema,
  LocalRoutine,
} from "@/types/models";
import { safeRequest } from "@/util/apiHelpers";
import { validateData } from "@/util/validateData";
import { z } from "zod";

export const syncRoutinesToServerResponseSchema = z.object({
  success: z.boolean(),
  updated: z.array(
    z.object({
      localId: z.number(),
      serverId: z.string(),
    })
  ),
});

export const fetchRoutineSchema = z.object({
  success: z.boolean(),
  routines: z.array(clientRoutineSchema),
});

export type SyncRoutinesToServerResponse = z.infer<
  typeof syncRoutinesToServerResponseSchema
>;

export type FetchRoutinesResponse = z.infer<typeof fetchRoutineSchema>;

export class RoutineApi implements IRoutineApi {
  constructor() {}

  async fetchRoutinesFromServer(userId: string): Promise<ClientRoutine[]> {
    const data = await safeRequest(
      `${BASE_URL}/api/routine/${userId}`,
      {},
      fetchRoutineSchema
    );

    const serverRoutines = data.routines;
    return serverRoutines;
  }

  async postRoutinesToServer(
    unsynced: LocalRoutine[]
  ): Promise<SyncRoutinesToServerResponse> {
    const data = await safeRequest(
      `${BASE_URL}/api/routine/sync`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unsynced }),
      },
      syncRoutinesToServerResponseSchema
    );

    return data;
  }
}
