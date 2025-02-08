import { BASE_URL } from "@/constants";
import { db } from "@/lib/db";
import { PatchBookmarkInput } from "@/types/dto/exercise.dto";
import { Category, ExerciseType } from "@/types/filters";
import { ClientExercise, ClientUser, LocalExercise } from "@/types/models";

export interface SyncChange {
  type: "addExercise" | "updateBookmark";
  payload: Partial<LocalExercise> & { userId: string };
}

export interface SyncResponse {
  success: boolean;
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
export async function overwriteWithServerExercises(userId: string) {
  const serverData: ClientExercise[] = await fetchExercisesFromServer(userId);
  if (!serverData) throw new Error("데이터 받아오기를 실패했습니다");
  await db.exercises.clear();
  const toInsert = serverData.map((ex) => ({
    ...ex,
    serverId: ex.id,
    isSynced: true,
  }));
  await db.exercises.bulkAdd(toInsert);
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

export async function syncToServer(userId: string): Promise<SyncResponse> {
  const all = await db.exercises.toArray();
  const unsynced = all.filter((x) => !x.isSynced);
  console.log(unsynced, "unsyncedunsyncedunsynced");

  const res = await fetch(`${BASE_URL}/api/exercises/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unsynced, userId }),
  });
  if (!res.ok) {
    throw new Error(`Sync failed: HTTP ${res.status}`);
  }

  for (const item of unsynced) {
    await db.exercises.update(item.id!, {
      isSynced: true,
    });
  }

  const data: SyncResponse = await res.json();
  return data;
}

// export const getAllExercises = async (
//   userId: ClientUser["id"] | undefined,
//   keyword: string,
//   exerciseType: ExerciseType,
//   category: Category
// ) => {
//   const queryParams = new URLSearchParams({
//     userId: userId?.toString() ?? "",
//     keyword: encodeURIComponent(keyword),
//     type: encodeURIComponent(exerciseType),
//     category: encodeURIComponent(category),
//   });

//   const res = await fetch(`${BASE_URL}/api/exercises/all?${queryParams}`);
//   if (!res.ok) {
//     throw new Error("Failed to fetch exercises");
//   }
//   return res.json();
// };
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
  // 1) 기존 로컬 DB 'exercises' 클리어
  await db.exercises.clear();

  // 2) serverData → local 형식 변환
  const toInsert = serverData.map((exercise) => ({
    ...exercise,
    serverId: exercise.id,
    isSynced: true,
  }));

  // 3) bulkAdd

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
