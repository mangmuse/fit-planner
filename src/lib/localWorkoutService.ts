import { db } from "@/lib/db";
import { LocalWorkout } from "@/types/models";

export const addLocalWorkout = async (
  userId: string,
  date: string
): Promise<LocalWorkout> => {
  console.log("hello");

  const existing = await db.workouts
    .where(["userId", "date"])
    .equals([userId, date])
    .first();
  console.log(existing);
  if (existing) {
    return existing;
  }

  const localId = await db.workouts.add({
    userId,
    date,
    createdAt: new Date().toISOString(),
    isSynced: false,
    serverId: null,
  });

  const workout = await db.workouts.get(localId);
  if (!workout) {
    throw new Error("Workout을 불러오지 못했습니다");
  }
  return workout;
};
