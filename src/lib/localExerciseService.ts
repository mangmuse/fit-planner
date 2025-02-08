import { db } from "@/lib/db";
import { LocalExercise } from "@/types/models";

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
