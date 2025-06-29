import { FETCH_ROUTINE_DETAILS_ERROR } from "./../constants/errorMessage";
import { BASE_URL } from "@/constants";
import { POST_ROUTINE_DETAILS_ERROR } from "@/constants/errorMessage";
import { IRoutineDetailApi } from "@/types/apis";
import {
  ClientRoutineDetail,
  clientRoutineDetailSchema,
  LocalRoutineDetailWithServerRoutineId,
} from "@/types/models";
import { safeRequest } from "@/util/apiHelpers";
import { validateData } from "@/util/validateData";
import { z } from "zod";

export const syncRoutineDetailsToServerResponseSchema = z.object({
  success: z.boolean(),
  updated: z.array(
    z.object({
      localId: z.number(),
      serverId: z.string(),
      exerciseId: z.number(),
      routineId: z.string(),
    })
  ),
});

export const fetchRoutineDetailsSchema = z.object({
  success: z.boolean(),
  routineDetails: z.array(clientRoutineDetailSchema),
});

export type SyncRoutineDetailsToServerResponse = z.infer<
  typeof syncRoutineDetailsToServerResponseSchema
>;

export type FetchRoutineDetailsResponse = z.infer<
  typeof fetchRoutineDetailsSchema
>;

export class RoutineDetailApi implements IRoutineDetailApi {
  constructor() {}

  async fetchRoutineDetailsFromServer(
    userId: string
  ): Promise<ClientRoutineDetail[]> {
    const data = await safeRequest(
      `${BASE_URL}/api/routine/detail?userId=${userId}`,
      {},
      fetchRoutineDetailsSchema
    );

    const serverRoutineDetails = data.routineDetails;
    return serverRoutineDetails;
  }

  async postRoutineDetailsToServer(
    mappedUnsynced: LocalRoutineDetailWithServerRoutineId[]
  ): Promise<SyncRoutineDetailsToServerResponse> {
    const data = await safeRequest(
      `${BASE_URL}/api/routine/detail/sync`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mappedUnsynced }),
      },
      syncRoutineDetailsToServerResponseSchema
    );

    return data;
  }
}
