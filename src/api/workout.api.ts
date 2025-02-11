import { BASE_URL } from "@/constants";
import {
  FETCH_WORKOUTS_ERROR,
  POST_WORKOUTS_ERROR,
} from "@/constants/errorMessage";
import { ClientWorkout, LocalWorkout } from "@/types/models";

export type SyncWorkoutsPayload = {
  unsynced: LocalWorkout[];
};

export interface SyncWorkoutsToServerResponse {
  success: boolean;
  updated: { localId: number; serverId: string }[];
}

export const fetchWorkoutFromServer = async (
  userId: string
): Promise<ClientWorkout[]> => {
  const res = await fetch(`${BASE_URL}/api/workout/${userId}`);
  if (!res.ok) throw new Error(FETCH_WORKOUTS_ERROR);
  const data = await res.json();
  const serverWorkouts = data.workouts;
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
  return data;
}
