import {
  fetchWorkoutDetailsFromServer,
  postWorkoutDetailsToServer,
} from "@/api/workoutDetail.api";
import { db } from "@/lib/db";
import {
  convertLocalWorkoutDetailToServer,
  getAddSetToWorkoutByLastSet,
  getNewWorkoutDetails,
  getStartExerciseOrder,
} from "@/adapter/workoutDetail.adapter";
import { getExerciseWithServerId } from "@/services/exercise.service";
import {
  addLocalWorkout,
  getWorkoutByUserIdAndDate,
  getWorkoutWithServerId,
} from "@/services/workout.service";
import { ClientWorkoutDetail, LocalWorkoutDetail } from "@/types/models";

export type NewWorkoutDetailInput = {
  workoutId: number;
  startOrder: number;
};

type AddWorkoutDetailsOptions = {
  workoutId?: number;
  startOrder?: number;
};

export const overwriteWithServerWorkoutDetails = async (
  userId: string
): Promise<void> => {
  const serverData: ClientWorkoutDetail[] =
    await fetchWorkoutDetailsFromServer(userId);

  const toInsert = await Promise.all(
    serverData.map(async (data) => {
      const exercise = await getExerciseWithServerId(data.exerciseId);

      const workout = await getWorkoutWithServerId(data.workoutId);

      if (!exercise?.id || !workout?.id)
        throw new Error("exerciseId 또는 workoutId가 없습니다");
      return {
        ...data,
        id: undefined,
        serverId: data.id,
        isSynced: true,
        exerciseId: exercise.id,
        workoutId: workout.id,
      };
    })
  );
  await db.workoutDetails.clear();
  await db.workoutDetails.bulkAdd(toInsert);
};
export async function addLocalWorkoutDetailsByUserDate(
  userId: string,
  date: string,
  selectedExercises: { id: number | undefined; name: string }[]
): Promise<number> {
  const workout = await addLocalWorkout(userId, date);
  const workoutId = workout.id!;

  const startOrder = await getStartExerciseOrder(workoutId);

  const newDetails = getNewWorkoutDetails(selectedExercises, {
    workoutId,
    startOrder,
  });

  const workoutDetails = await db.workoutDetails.bulkAdd(newDetails);
  return workoutDetails;
}

export async function addLocalWorkoutDetailsByWorkoutId(
  workoutId: number,
  startOrder: number,
  selectedExercises: { id: number; name: string }[]
): Promise<number> {
  if (startOrder == null) {
    startOrder = await getStartExerciseOrder(workoutId);
  }
  const newDetails = getNewWorkoutDetails(selectedExercises, {
    workoutId,
    startOrder,
  });
  const workoutDetails = await db.workoutDetails.bulkAdd(newDetails);

  return workoutDetails;
}

export const getLocalWorkoutDetails = async (
  userId: string,
  date: string
): Promise<LocalWorkoutDetail[]> => {
  let workout = await getWorkoutByUserIdAndDate(userId, date);

  if (!workout) {
    workout = await addLocalWorkout(userId, date);
  }

  if (!workout?.id) throw new Error("workoutId를 가져오지 못했습니다");

  const details = await db.workoutDetails
    .where("workoutId")
    .equals(workout.id)
    .toArray();

  return details;
};

export const updateLocalWorkoutDetail = async (
  updateWorkoutInput: Partial<LocalWorkoutDetail>
): Promise<void> => {
  if (!updateWorkoutInput.id) throw new Error("id가 없습니다");
  await db.workoutDetails.update(updateWorkoutInput.id, updateWorkoutInput);
};

export const addSetToWorkout = async (
  lastSet: LocalWorkoutDetail
): Promise<number> => {
  const addSetInput = getAddSetToWorkoutByLastSet(lastSet);
  const newSet = await db.workoutDetails.add(addSetInput);
  return newSet;
};

export const deleteWorkoutDetail = async (lastSetId: number): Promise<void> => {
  db.workoutDetails.delete(lastSetId);
};

export const deleteWorkoutDetails = async (
  details: LocalWorkoutDetail[]
): Promise<void> => {
  Promise.all(
    details.map(async (detail) => {
      if (!detail.id) throw new Error("id가 없습니다");
      await db.workoutDetails.delete(detail.id);
    })
  );
};

export const syncToServerWorkoutDetails = async (): Promise<void> => {
  const all = await db.workoutDetails.toArray();

  const unsynced = all.filter((detail) => !detail.isSynced);
  const mappedUnsynced = await convertLocalWorkoutDetailToServer(unsynced);
  const data = await postWorkoutDetailsToServer(mappedUnsynced);

  if (data.updated.length === 0) return;

  if (data.updated) {
    for (const updated of data.updated) {
      const exercise = await getExerciseWithServerId(updated.exerciseId);
      const workout = await getWorkoutWithServerId(updated.workoutId);
      await db.workoutDetails.update(updated.localId, {
        serverId: updated.serverId,
        isSynced: true,
        exerciseId: exercise?.id,
        workoutId: workout?.id,
      });
    }
  }
};
