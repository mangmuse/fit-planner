import { BASE_URL } from "@/constants";
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
  console.log(res);
  if (!res.ok) throw new Error("Workout fetch에 실패했습니다");
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

  if (!res.ok) throw new Error("Workouts 동기화에 실패했습니다");

  const data = await res.json();
  return data;
}
