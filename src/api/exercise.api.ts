import { LocalWorkout } from "../types/models";
import { BASE_URL } from "@/constants";
import { db } from "@/lib/db";
import { PatchBookmarkInput } from "@/types/dto/exercise.dto";
import { Category, ExerciseType } from "@/types/filters";
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
    throw new Error("Failed to fetch exercises from server");
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
    throw new Error(`Sync failed: HTTP ${res.status}`);
  }

  const data: SyncExercisesToServerResponse = await res.json();
  return data;
}

export const getAllExercises = async (userId: ClientUser["id"] | undefined) => {
  const queryParams = new URLSearchParams({
    userId: userId?.toString() ?? "",
  });

  const res = await fetch(`${BASE_URL}/api/exercises/all?${queryParams}`);
  if (!res.ok) {
    throw new Error("Failed to fetch exercises");
  }
  return res.json();
};

export const patchBookmark = async (patchBookmarkInput: PatchBookmarkInput) => {
  const res = await fetch(`${BASE_URL}/api/exercises/bookmark`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patchBookmarkInput),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch exercises");
  }
  return res.json();
};

// 2) 로컬 DB에 저장
export async function saveExercisesToLocal(serverData: ClientExercise[]) {
  await db.exercises.clear();

  const toInsert = serverData.map((exercise) => ({
    ...exercise,
    serverId: exercise.id,
    isSynced: true,
  }));

  await db.exercises.bulkAdd(toInsert);
}

// 3) 초기 로딩 or 재로딩 시 사용
export async function loadExercisesFromServer(userId: string) {
  try {
    const serverData = await fetchExercisesFromServer(userId);
    await saveExercisesToLocal(serverData);
  } catch (err) {
    console.error("fetch or save error:", err);
    // 오프라인이면 기존 로컬 DB만 사용
  }
}

export async function mergeServerExerciseData(serverData: ClientExercise[]) {
  const localAll = await db.exercises.toArray();

  const serverMapped = serverData.map((s) => ({
    ...s,
    serverId: s.id,
    isSynced: true,
    updatedAt: new Date().toISOString(),
  }));
  const merged: LocalExercise[] = [];

  for (const localExercise of localAll) {
    if (!localExercise.serverId) {
      merged.push(localExercise);
    }
  }

  for (const serverExercise of serverMapped) {
    const localMatch = localAll.find(
      (local) => local.serverId === serverExercise.serverId
    );
    if (!localMatch) {
      merged.push({
        ...serverExercise,
      });
    } else {
      if (localMatch.isSynced === false) {
        merged.push(localMatch);
      } else {
        merged.push({
          ...localMatch,
          ...serverExercise,
          id: localMatch.id,
        });
      }
    }
  }

  await db.exercises.clear();
  await db.exercises.bulkPut(merged);
}
