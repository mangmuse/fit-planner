import { db } from "@/lib/db";
import { LocalExercise } from "@/types/models";

export const addLocalExercise = async () => {};

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
