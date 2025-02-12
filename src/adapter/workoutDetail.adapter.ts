import { db } from "@/lib/db";
import {
  getExerciseName,
  getExerciseWithLocalId,
} from "@/services/exercise.service";
import { getWorkoutWithLocalId } from "@/services/workout.service";
import { NewWorkoutDetailInput } from "@/services/workoutDetail.service";
import { LocalWorkoutDetail } from "@/types/models";

export const getAddSetInputByLastSet = (lastSet: LocalWorkoutDetail) => {
  const { id, setOrder, isSynced, isDone, updatedAt, ...rest } = lastSet;
  const addSetInput = {
    ...rest,
    isSynced: false,
    isDone: false,
    setOrder: setOrder + 1,
    createdAt: new Date().toISOString(),
  };
  return addSetInput;
};

export const getNewDetails = async (
  selectedExercises: number[],
  { workoutId, startOrder }: NewWorkoutDetailInput
) => {
  const detailPromises = selectedExercises.map(async (exerciseId, idx) => {
    const exerciseName = await getExerciseName(exerciseId);
    const newValue = {
      exerciseId,
      workoutId,
      exerciseOrder: startOrder + idx,
      exerciseName,
    };

    const defaultValue = {
      setOrder: 1,
      serverId: null,
      weight: 0,
      rpe: null,
      reps: 0,
      isDone: false,
      isSynced: false,
      createdAt: new Date().toISOString(),
    };
    const newDetail: LocalWorkoutDetail = {
      ...defaultValue,
      ...newValue,
    };
    return newDetail;
  });
  const newDetails: LocalWorkoutDetail[] = await Promise.all(detailPromises);
  return newDetails;
};

export const convertLocalWorkoutDetailToServer = async (
  unsynced: LocalWorkoutDetail[]
) => {
  return await Promise.all(
    unsynced.map(async (detail) => {
      const exercise = await getExerciseWithLocalId(detail.exerciseId);
      const workout = await getWorkoutWithLocalId(detail.workoutId);
      if (!exercise.serverId || !workout.serverId)
        throw new Error("exerciseId 또는 workoutId가 없다는데요? 이게 왜없지");
      return {
        ...detail,
        exerciseId: exercise?.serverId,
        workoutId: workout?.serverId,
      };
    })
  );
};
export const getStartExerciseOrder = async (
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
