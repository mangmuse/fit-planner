import { BASE_URL } from "@/constants";
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

export const fetchWorkoutDetailsFromServer = async (userId: string) => {
  const res = await fetch(`${BASE_URL}/api/workout/detail/${userId}`);
  if (!res.ok) {
    throw new Error("서버로부터 workoutDetail fetching 을 실패했습니다");
  }
  const data = await res.json();

  const serverData: ClientWorkoutDetail[] = data.workoutDetails;
  console.log(serverData);
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

  if (!res.ok) throw new Error("WorkoutDetails 동기화에 실패했습니다");

  const data: SyncWorkoutDetailsToServerResponse = await res.json();
  return data;
}
