import { BASE_URL } from "@/constants";
import { z } from "zod";

import {
  ClientWorkout,
  LocalWorkout,
  clientWorkoutSchema,
} from "@/types/models";
import { IWorkoutApi } from "@/types/apis";
import { safeRequest } from "@/util/apiHelpers";

export const syncWorkoutsToServerResponseSchema = z.object({
  success: z.boolean(),
  updated: z.array(
    z.object({
      localId: z.number(),
      serverId: z.string(),
    })
  ),
});

export const fetchWorkoutSchema = z.object({
  success: z.boolean(),
  workouts: z.array(clientWorkoutSchema),
});

export type SyncWorkoutsPayload = {
  unsynced: LocalWorkout[];
};

export type SyncWorkoutsToServerResponse = z.infer<
  typeof syncWorkoutsToServerResponseSchema
>;

export type FetchWorkoutsResponse = z.infer<typeof fetchWorkoutSchema>;

export class WorkoutApi implements IWorkoutApi {
  constructor() {}
  async fetchWorkoutsFromServer(userId: string): Promise<ClientWorkout[]> {
    const data = await safeRequest(
      `${BASE_URL}/api/workout?userId=${userId}`,
      {},
      fetchWorkoutSchema
    );

    const serverWorkouts = data.workouts;
    return serverWorkouts;
  }

  async postWorkoutsToServer(
    unsynced: LocalWorkout[]
  ): Promise<SyncWorkoutsToServerResponse> {
    const data = await safeRequest(
      `${BASE_URL}/api/workout/sync`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unsynced }),
      },
      syncWorkoutsToServerResponseSchema
    );

    return data;
  }
}
