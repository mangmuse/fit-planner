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
  try {
    const workout = await db.workouts
      .where(["userId", "date"])
      .equals([userId, date])
      .first();

    return workout;
  } catch (e) {
    throw new Error("workout을 불러오는 데 실패했습니다");
  }
};

// export const getPastWorkouts = async (
//   workoutId: number
// ): Promise<LocalWorkout[]> => {};

export const getAllWorkouts = async (
  userId: string
): Promise<LocalWorkout[]> => {
  try {
    const workouts = await db.workouts
      .where("userId")
      .equals(userId)
      .sortBy("date")
      .then((workouts) => workouts.reverse());

    return workouts;
  } catch (e) {
    throw new Error("workout 목록을 불러오는 데 실패했습니다");
  }
};
export const getWorkoutWithServerId = async (
  serverId: string
): Promise<LocalWorkout | void> => {
  try {
    const workout = await db.workouts
      .where("serverId")
      .equals(serverId)
      .first();
    return workout;
  } catch (e) {
    throw new Error("workout을 불러오는 데 실패했습니다");
  }
};
export const getWorkoutWithLocalId = async (
  id: number
): Promise<LocalWorkout | void> => {
  try {
    const workout = await db.workouts.where("id").equals(id).first();
    return workout;
  } catch (e) {
    throw new Error("workout을 불러오는 데 실패했습니다");
  }
};

export const updateWorkout = async (
  updatedWorkout: Partial<LocalWorkout>
): Promise<void> => {
  if (!updatedWorkout.id) {
    throw new Error("workout id는 꼭 전달해주세요");
  }
  try {
    await db.workouts.update(updatedWorkout.id, {
      ...updatedWorkout,
      updatedAt: new Date().toISOString(),
      isSynced: false,
    });
  } catch (e) {
    throw new Error("workout 업데이트에 실패했습니다");
  }
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
  const serverData: ClientWorkout[] = await fetchWorkoutsFromServer(userId);
  if (!serverData) throw new Error("데이터 받아오기를 실패했습니다");
  if (serverData.length === 0) return;
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
  try {
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
    if (!workout) throw new Error("Workout을 불러오지 못했습니다");

    return workout;
  } catch (e) {
    throw new Error("Workout 추가에 실패했습니다");
  }
};

export const updateLocalWorkout = async (workout: Partial<LocalWorkout>) => {
  if (!workout.id) throw new Error("workout id는 필수입니다");
  try {
    await db.workouts.update(workout.id, {
      ...workout,
      updatedAt: new Date().toISOString(),
      isSynced: false,
    });
  } catch (e) {
    throw new Error("Workout 업데이트에 실패했습니다");
  }
};

export const getThisMonthWorkouts = async (
  startDate: string,
  endDate: string
): Promise<LocalWorkout[]> => {
  try {
    const workouts = await db.workouts
      .where("date")
      .between(startDate, endDate, true, true)
      .filter((workout) => workout.status !== "EMPTY")
      .toArray();
    return workouts;
  } catch (e) {
    throw new Error("이번 달 workout 목록을 불러오는 데 실패했습니다");
  }
};

export const deleteLocalWorkout = async (workoutId: number) => {
  try {
    await db.workouts.delete(workoutId);
  } catch (e) {
    throw new Error("Workout 삭제에 실패했습니다");
  }
};
