import {
  fetchWorkoutDetailsFromServer,
  postWorkoutDetailsToServer,
} from "@/api/workoutDetail.api";
import { db } from "@/lib/db";
import {
  convertLocalWorkoutDetailToServer,
  getAddSetInputByLastSet,
  getNewDetails,
} from "@/repositories/workoutDetail.repository";
import {
  getExerciseWithLocalId,
  getExerciseWithServerId,
} from "@/services/exercise.service";
import {
  addLocalWorkout,
  getWorkoutWithLocalId,
  getWorkoutWithServerId,
} from "@/services/workout.service";
import {
  ClientWorkoutDetail,
  LocalWorkout,
  LocalWorkoutDetail,
} from "@/types/models";

export type NewWorkoutDetailInput = {
  workoutId: number;
  startOrder: number;
};

export const overwriteWithServerWorkoutDetails = async (userId: string) => {
  const serverData: ClientWorkoutDetail[] = await fetchWorkoutDetailsFromServer(
    userId
  );
  const toInsert = await Promise.all(
    serverData.map(async (data) => {
      const exercise = await db.exercises
        .where("serverId")
        .equals(data.exerciseId)
        .first();
      const workout = await db.workouts
        .where("serverId")
        .equals(data.workoutId)
        .first();

      if (!exercise?.id || !workout?.id)
        throw new Error("exerciseId 또는 workoutId가 없습니다");
      return {
        ...data,
        id: undefined,
        serverId: data.id,
        isSynced: true,
        exerciseId: exercise?.id,
        workoutId: workout?.id,
      };
    })
  );
  await db.workoutDetails.clear();
  await db.workoutDetails.bulkAdd(toInsert);
};

export const getstartExerciseOrder = async (
  workoutId: number
): Promise<number> => {
  const allDetails = await db.workoutDetails
    .where("workoutId")
    .equals(workoutId)
    .sortBy("exerciseOrder");
  const lastDetail = allDetails[allDetails.length - 1];
  const startOrder = lastDetail ? lastDetail.exerciseOrder + 1 : 1;
  return startOrder;
};

export async function addLocalWorkoutDetails(
  userId: string,
  date: string,
  selectedExercises: number[]
): Promise<number> {
  const workout = await addLocalWorkout(userId, date);
  const workoutId = workout.id!;
  const startOrder = await getstartExerciseOrder(workoutId);
  const newDetails = await getNewDetails(selectedExercises, {
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
  let workout = await db.workouts.where({ userId, date }).first();

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
  console.log("good");
  if (!updateWorkoutInput.id) throw new Error("id가 없습니다");
  await db.workoutDetails.update(updateWorkoutInput.id, updateWorkoutInput);
};

export const addSet = async (lastSet: LocalWorkoutDetail) => {
  const addSetInput = getAddSetInputByLastSet(lastSet);
  const newSet = await db.workoutDetails.add(addSetInput);
  return newSet;
};

export const deleteSet = async (
  lastSetId: LocalWorkoutDetail["id"]
): Promise<void> => {
  if (!lastSetId) throw new Error("삭제할 id가 제공되지않았습니다");
  db.workoutDetails.delete(lastSetId);
};

export const syncToServerWorkoutDetails = async () => {
  const all = await db.workoutDetails.toArray();

  const unsynced = all.filter((detail) => !detail.isSynced);

  const mappedUnsynced = await convertLocalWorkoutDetailToServer(unsynced);

  const data = await postWorkoutDetailsToServer(mappedUnsynced);

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
