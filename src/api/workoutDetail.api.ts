import { BASE_URL } from "@/constants";
import {
  FETCH_WORKOUT_DETAILS_ERROR,
  POST_WORKOUT_DETAILS_ERROR,
} from "@/constants/errorMessage";
import { ClientWorkoutDetail, LocalWorkoutDetail } from "@/types/models";

export interface SyncWorkoutDetailsToServerResponse {
  success: boolean;
  updated: {
    localId: number;
    serverId: string;
    exerciseId: number;
    workoutId: string;
  }[];
}

export type SyncWorkoutDetailsPayload = {
  mappedUnsynced: (Omit<LocalWorkoutDetail, "workoutId"> & {
    workoutId: string;
  })[];
};

export const fetchWorkoutDetailsFromServer = async (
  userId: string
): Promise<ClientWorkoutDetail[]> => {
  const res = await fetch(`${BASE_URL}/api/workout/detail/${userId}`);
  if (!res.ok) {
    throw new Error(FETCH_WORKOUT_DETAILS_ERROR);
  }
  const data = await res.json();

  const serverData: ClientWorkoutDetail[] = data.workoutDetails;
  return serverData;
};

export async function postWorkoutDetailsToServer(
  mappedUnsynced: (Omit<LocalWorkoutDetail, "workoutId"> & {
    workoutId: string;
  })[]
): Promise<SyncWorkoutDetailsToServerResponse> {
  const res = await fetch(`${BASE_URL}/api/workout/detail/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mappedUnsynced }),
  });

  if (!res.ok) throw new Error(POST_WORKOUT_DETAILS_ERROR);

  const data: SyncWorkoutDetailsToServerResponse = await res.json();
  return data;
}
