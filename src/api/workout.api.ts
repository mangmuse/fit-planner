import { BASE_URL } from "@/constants";
import { z } from "zod";
import {
  FETCH_WORKOUTS_ERROR,
  POST_WORKOUTS_ERROR,
} from "@/constants/errorMessage";
import {
  ClientWorkout,
  LocalWorkout,
  clientWorkoutSchema,
} from "@/types/models";
import { validateData } from "@/util/validateData";
import { IWorkoutApi } from "@/types/apis";
import { safeRequest } from "@/util/api-helpers";
import { s } from "node_modules/msw/lib/core/HttpResponse-I457nh8V.mjs";

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
      `${BASE_URL}/api/workout/${userId}`,
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
