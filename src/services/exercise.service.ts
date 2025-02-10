import {
  fetchExercisesFromServer,
  postExercisesToServer,
} from "@/api/exercise.api";
import { db } from "@/lib/db";
import { mergeServerExerciseData } from "@/adapter/exercise.repository";
import { ClientExercise, LocalExercise } from "@/types/models";

export const syncExercisesLocalFirst = async () => {};

export const getExerciseWithServerId = async (
  serverId: number
): Promise<LocalExercise> => {
  const exercise = await db.exercises
    .where("serverId")
    .equals(serverId)
    .first();
  if (!exercise) throw new Error("일치하는 exercise가 없습니다");
  return exercise;
};
export const getExerciseWithLocalId = async (
  id: number
): Promise<LocalExercise> => {
  const exercise = await db.exercises.where("id").equals(id).first();
  if (!exercise) throw new Error("일치하는 exercise가 없습니다");
  return exercise;
};

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

export async function syncExercisesFromServer(userId: string) {
  const serverData: ClientExercise[] = await fetchExercisesFromServer(userId);
  const merged = await mergeServerExerciseData(serverData);

  await db.exercises.clear();
  await db.exercises.bulkPut(merged);
}

export async function getAllLocalExercises(): Promise<LocalExercise[]> {
  return db.exercises.toArray();
}

export const toggleLocalBookmark = async (
  localId: number,
  nextValue: boolean
) => {
  await db.exercises.update(localId, {
    isBookmarked: nextValue,
    isSynced: false,
    updatedAt: new Date().toISOString(),
  });
};

export const getUnsyncedExercises = async (): Promise<LocalExercise[]> => {
  return db.exercises.where("isSynced").equals(0).toArray();
};

export const getExerciseName = async (exerciseId: number): Promise<string> => {
  const exercise = await db.exercises.get(exerciseId);
  if (!exercise) throw new Error("id와 일치하는 exercise를 찾을 수 없습니다");
  return exercise.name;
};

export async function syncToServerExercises(userId: string): Promise<void> {
  const all = await db.exercises.toArray();
  const unsynced = all.filter((x) => !x.isSynced);

  const data = await postExercisesToServer(unsynced, userId);

  for (const updated of data.updated) {
    await db.exercises.update(updated.localId, {
      isSynced: true,
      serverId: updated.serverId,
    });
  }
}
