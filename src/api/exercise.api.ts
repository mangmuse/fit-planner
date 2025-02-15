import { BASE_URL } from "@/constants";
import {
  FETCH_EXERCISES_ERROR,
  POST_EXERCISES_ERROR,
} from "@/constants/errorMessage";

import {
  ClientExercise,
  clientExerciseSchema,
  ClientUser,
  LocalExercise,
} from "@/types/models";
import { validateData } from "@/util/validateData";
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

export async function fetchExercisesFromServer(
  userId: ClientUser["id"]
): Promise<ClientExercise[]> {
  const queryParams = new URLSearchParams({ userId: userId ?? "" });
  const res = await fetch(`${BASE_URL}/api/exercises/all?${queryParams}`);
  if (!res.ok) {
    throw new Error(FETCH_EXERCISES_ERROR);
  }
  const serverData = await res.json();
  const parsedExercises = validateData<FetchExercisesResponse>(
    fetchExercisesSchema,
    serverData
  );
  const serverWorkouts = parsedExercises.exercises;
  return serverWorkouts;
}

export async function postExercisesToServer(
  unsynced: LocalExercise[],
  userId: string
): Promise<SyncExercisesToServerResponse> {
  const res = await fetch(`${BASE_URL}/api/exercises/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unsynced, userId }),
  });
  if (!res.ok) {
    throw new Error(POST_EXERCISES_ERROR);
  }

  const data = await res.json();

  const parsedData = validateData<SyncExercisesToServerResponse>(
    syncExercisesToServerResponseSchema,
    data
  );

  return parsedData;
}
