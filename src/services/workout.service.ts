import {
  fetchWorkoutsFromServer,
  postWorkoutsToServer,
} from "@/api/workout.api";
import { db } from "@/lib/db";
import { ClientWorkout, LocalWorkout } from "@/types/models";
import { getFormattedDateYMD } from "@/util/formatDate";

export const getWorkoutByUserIdAndDate = async (
  userId: string,
  date: string
): Promise<LocalWorkout | void> => {
  const workout = await db.workouts
    .where(["userId", "date"])
    .equals([userId, date])
    .first();

  return workout;
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
): Promise<LocalWorkout | void> => {
  const workout = await db.workouts.where("id").equals(id).first();
  console.log(workout, "이거 나오잖아 그치?");
  return workout;
};

export const syncToServerWorkouts = async (): Promise<void> => {
  const all = await db.workouts.toArray();
  console.log("all workouts to sync:", all);

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
  const serverData: ClientWorkout[] = await fetchWorkoutsFromServer(userId);
  if (!serverData) throw new Error("데이터 받아오기를 실패했습니다");
  if (serverData.length === 0) return;
  console.log(getFormattedDateYMD(serverData[0].date), "date 형태 확인");
  const toInsert = serverData.map((workout) => ({
    id: undefined,
    userId: workout.userId,
    serverId: workout.id,
    date: getFormattedDateYMD(workout.date),
    isSynced: true,
    status: "EMPTY" as const,
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
    status: "EMPTY",
    serverId: null,
  });

  const workout = await getWorkoutWithLocalId(localId);
  if (!workout) {
    throw new Error("Workout을 불러오지 못했습니다");
  }
  return workout;
};

export const updateLocalWorkout = async (workout: Partial<LocalWorkout>) => {
  try {
    if (!workout.id) throw "workout id는 꼭 전달해주세요";
    await db.workouts.update(workout.id, {
      ...workout,
      updatedAt: new Date().toISOString(),
      isSynced: false,
    });
  } catch (e) {
    throw new Error("Workout 업데이트에 실패했습니다");
  }
};

export const getThisMonthWorkouts = (
  startDate: string,
  endDate: string
): Promise<LocalWorkout[]> => {
  return db.workouts
    .where("date")
    .between(startDate, endDate, true, true)
    .filter((workout) => workout.status !== "EMPTY")
    .toArray();
};
