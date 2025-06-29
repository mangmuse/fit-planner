import { BASE_URL } from "@/constants";
import {
  FETCH_WORKOUT_DETAILS_ERROR,
  POST_WORKOUT_DETAILS_ERROR,
} from "@/constants/errorMessage";
import { IWorkoutDetailApi } from "@/types/apis";
import {
  ClientWorkoutDetail,
  clientWorkoutDetailSchema,
  LocalWorkoutDetail,
  LocalWorkoutDetailWithServerWorkoutId,
} from "@/types/models";
import { safeRequest } from "@/util/apiHelpers";
import { z } from "zod";

export const syncWorkoutDetailsToServerResponseSchema = z.object({
  success: z.boolean(),
  updated: z.array(
    z.object({
      localId: z.number(),
      serverId: z.string(),
      exerciseId: z.number(),
      workoutId: z.string(),
    })
  ),
});

export const fetchWorkoutDetailsSchema = z.object({
  success: z.boolean(),
  workoutDetails: z.array(clientWorkoutDetailSchema),
});

export type SyncWorkoutDetailsToServerResponse = z.infer<
  typeof syncWorkoutDetailsToServerResponseSchema
>;

export type SyncWorkoutDetailsPayload = {
  mappedUnsynced: (Omit<LocalWorkoutDetail, "workoutId"> & {
    workoutId: string;
  })[];
};

export type FetchWorkoutDetailsResponse = z.infer<
  typeof fetchWorkoutDetailsSchema
>;

export class WorkoutDetailApi implements IWorkoutDetailApi {
  constructor() {}

  async fetchWorkoutDetailsFromServer(
    userId: string
  ): Promise<ClientWorkoutDetail[]> {
    const data = await safeRequest(
      `${BASE_URL}/api/workout/detail?userId=${userId}`,
      {},
      fetchWorkoutDetailsSchema
    );

    const serverWorkoutDetails = data.workoutDetails;

    return serverWorkoutDetails;
  }

  async postWorkoutDetailsToServer(
    mappedUnsynced: LocalWorkoutDetailWithServerWorkoutId[]
  ): Promise<SyncWorkoutDetailsToServerResponse> {
    const data = await safeRequest(
      `${BASE_URL}/api/workout/detail/sync`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mappedUnsynced }),
      },
      syncWorkoutDetailsToServerResponseSchema
    );

    return data;
  }
}
