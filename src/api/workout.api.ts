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

export type FetchWorkoutResponse = z.infer<typeof fetchWorkoutSchema>;

export const fetchWorkoutFromServer = async (
  userId: string
): Promise<ClientWorkout[]> => {
  const res = await fetch(`${BASE_URL}/api/workout/${userId}`);
  if (!res.ok) throw new Error(FETCH_WORKOUTS_ERROR);
  const data = await res.json();
  const parsedData = validateData<FetchWorkoutResponse>(
    fetchWorkoutSchema,
    data
  );
  const serverWorkouts = parsedData.workouts;
  return serverWorkouts;
};

export async function postWorkoutsToServer(
  unsynced: LocalWorkout[]
): Promise<SyncWorkoutsToServerResponse> {
  const res = await fetch(`${BASE_URL}/api/workout/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unsynced }),
  });

  if (!res.ok) throw new Error(POST_WORKOUTS_ERROR);

  const data = await res.json();

  const parsedData = validateData<SyncWorkoutsToServerResponse>(
    syncWorkoutsToServerResponseSchema,
    data
  );

  return parsedData;
}
