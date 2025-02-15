import {
  fetchWorkoutFromServer,
  postWorkoutsToServer,
} from "@/api/workout.api";
import { db } from "@/lib/db";
import { ClientWorkout, LocalWorkout } from "@/types/models";

export const getWorkoutByUserIdAndDate = async (
  userId: string,
  date: string
) => {
  return db.workouts.where(["userId", "date"]).equals([userId, date]).first();
};

export const getWorkoutWithServerId = async (
  serverId: string
): Promise<LocalWorkout> => {
  const workout = await db.workouts.where("serverId").equals(serverId).first();
  if (!workout) throw new Error("일치하는 workout이 없습니다");
  return workout;
};
export const getWorkoutWithLocalId = async (
  id: number
): Promise<LocalWorkout> => {
  const workout = await db.workouts.where("id").equals(id).first();
  if (!workout) throw new Error("일치하는 workout이 없습니다");
  return workout;
};

export const syncToServerWorkouts = async (): Promise<void> => {
  const all = await db.workouts.toArray();

  const unsynced = all.filter((workout) => !workout.isSynced);
  const data = await postWorkoutsToServer(unsynced);

  if (data.updated) {
    for (const updated of data.updated) {
      await db.workouts.update(updated.localId, {
        serverId: updated.serverId,
        isSynced: true,
      });
    }
  }
};

export async function overwriteWithServerWorkouts(
  userId: string
): Promise<void> {
  const serverData: ClientWorkout[] = await fetchWorkoutFromServer(userId);
  if (!serverData) throw new Error("데이터 받아오기를 실패했습니다");
  if (serverData.length === 0) return;
  const toInsert = serverData.map((workout) => ({
    id: undefined,
    userId: workout.userId,
    serverId: workout.id,
    date: workout.date,
    isSynced: true,
    createdAt: workout.createdAt,
    updatedAt: workout.updatedAt,
  }));
  await db.workouts.clear();

  await db.workouts.bulkAdd(toInsert);
}

export const addLocalWorkout = async (
  userId: string,
  date: string
): Promise<LocalWorkout> => {
  const existing = await getWorkoutByUserIdAndDate(userId, date);
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

  const workout = await getWorkoutWithLocalId(localId);
  if (!workout) {
    throw new Error("Workout을 불러오지 못했습니다");
  }
  return workout;
};
