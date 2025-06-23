import { safeRequest } from "@/util/api-helpers";
import { BASE_URL } from "@/constants";
import {
  FETCH_EXERCISES_ERROR,
  POST_EXERCISES_ERROR,
} from "@/constants/errorMessage";
import { IExerciseApi } from "@/types/apis";

import {
  ClientExercise,
  clientExerciseSchema,
  ClientUser,
  LocalExercise,
} from "@/types/models";
import { z } from "zod";

export const fetchExercisesSchema = z.object({
  success: z.boolean(),
  exercises: z.array(clientExerciseSchema),
});

export const syncExercisesToServerResponseSchema = z.object({
  success: z.boolean(),
  updated: z.array(
    z.object({
      localId: z.number(),
      serverId: z.number(),
    })
  ),
});

export type SyncExercisesToServerResponse = z.infer<
  typeof syncExercisesToServerResponseSchema
>;
export type FetchExercisesResponse = z.infer<typeof fetchExercisesSchema>;
export class ExerciseApi implements IExerciseApi {
  constructor() {}
  async fetchExercisesFromServer(
    userId: ClientUser["id"]
  ): Promise<ClientExercise[]> {
    const queryParams = new URLSearchParams({ userId: userId ?? "" });

    const serverData = await safeRequest(
      `${BASE_URL}/api/exercises/all?${queryParams}`,
      {},
      fetchExercisesSchema
    );

    const serverExercises = serverData.exercises;
    return serverExercises;
  }

  async postExercisesToServer(
    unsynced: LocalExercise[],
    userId: string
  ): Promise<SyncExercisesToServerResponse> {
    const data = await safeRequest(
      `${BASE_URL}/api/exercises/sync`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unsynced, userId }),
      },
      syncExercisesToServerResponseSchema
    );

    return data;
  }
}
