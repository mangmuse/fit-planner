import { BASE_URL } from "@/constants";
import {
  FETCH_EXERCISES_ERROR,
  POST_EXERCISES_ERROR,
} from "@/constants/errorMessage";

import { ClientExercise, ClientUser, LocalExercise } from "@/types/models";

export interface SyncChange {
  type: "addExercise" | "updateBookmark";
  payload: Partial<LocalExercise> & { userId: string };
}

export interface SyncExercisesToServerResponse {
  success: boolean;
  updated: { localId: number; serverId: number }[];
}

export async function fetchExercisesFromServer(userId: ClientUser["id"]) {
  const queryParams = new URLSearchParams({ userId: userId ?? "" });
  const res = await fetch(`${BASE_URL}/api/exercises/all?${queryParams}`);
  if (!res.ok) {
    throw new Error(FETCH_EXERCISES_ERROR);
  }
  const serverData: ClientExercise[] = await res.json();
  return serverData;
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

  const data: SyncExercisesToServerResponse = await res.json();
  return data;
}
