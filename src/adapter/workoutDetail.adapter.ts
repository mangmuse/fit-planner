import { db } from "@/lib/db";
import {
  getExerciseWithLocalId,
  getExerciseWithServerId,
} from "@/services/exercise.service";
import {
  getWorkoutWithLocalId,
  getWorkoutWithServerId,
} from "@/services/workout.service";
import { NewWorkoutDetailInput } from "@/services/workoutDetail.service";
import {
  LocalWorkoutDetail,
  LocalWorkoutDetailWithServerWorkoutId,
} from "@/types/models";

export function createDetail(
  override: Partial<LocalWorkoutDetail>
): LocalWorkoutDetail {
  const { exerciseName, exerciseId, exerciseOrder, setOrder, workoutId } =
    override;
  if (!exerciseName || !exerciseId || !exerciseOrder || !setOrder || !workoutId)
    throw new Error(
      "exerciseName, exerciseId, exerciseOrder, setOrder, workoutId 는 필수 입력사항입니다."
    );
  const defaultValue: LocalWorkoutDetail = {
    serverId: null,
    weight: 0,
    rpe: null,
    reps: 0,
    isDone: false,
    isSynced: false,
    setOrder: 1,
    exerciseOrder: 1,
    exerciseName: "",
    exerciseId: 0,
    workoutId: 0,
    createdAt: new Date().toISOString(),
  };

  return {
    ...defaultValue,
    ...override,
  };
}

export const getAddSetInputByLastSet = (
  lastSet: LocalWorkoutDetail
): LocalWorkoutDetail => {
  const { id, rpe, setOrder, isSynced, isDone, updatedAt, ...rest } = lastSet;
  const addSetInput = {
    ...rest,
    rpe: 0,
    serverId: null,
    isSynced: false,
    isDone: false,
    setOrder: setOrder + 1,
    createdAt: new Date().toISOString(),
  };

  return createDetail(addSetInput);
};

export const getNewDetails = (
  selectedExercises: { id: number | undefined; name: string }[],
  { workoutId, startOrder }: NewWorkoutDetailInput
): LocalWorkoutDetail[] => {
  const newDetails: LocalWorkoutDetail[] = selectedExercises.map(
    ({ id, name }, idx) => {
      if (!id || !name)
        throw new Error(
          "getNewDetails: exerciseId 또는 exerciseName이 없습니다"
        );
      const newValue = {
        exerciseId: id,
        workoutId,
        exerciseOrder: startOrder + idx,
        setOrder: 1,
        exerciseName: name,
      };
      return createDetail(newValue);
    }
  );

  return newDetails;
};

export const convertLocalWorkoutDetailToServer = async (
  workoutDetails: LocalWorkoutDetail[]
): Promise<LocalWorkoutDetailWithServerWorkoutId[]> => {
  return await Promise.all(
    workoutDetails.map(async (detail) => {
      const exercise = await getExerciseWithLocalId(detail.exerciseId);
      const workout = await getWorkoutWithLocalId(detail.workoutId);

      if (!exercise.serverId || !workout.serverId) {
        throw new Error("exerciseId 또는 workoutId가 없습니다");
      }
      return {
        ...detail,
        exerciseId: exercise?.serverId,
        workoutId: workout?.serverId,
      };
    })
  );
};
export const convertServerWorkoutDetailToLocal = async (
  workoutDetails: LocalWorkoutDetailWithServerWorkoutId[]
): Promise<LocalWorkoutDetail[]> => {
  return await Promise.all(
    workoutDetails.map(async (detail) => {
      const exercise = await getExerciseWithServerId(detail.exerciseId);
      const workout = await getWorkoutWithServerId(detail.workoutId);

      if (!exercise.id || !workout.id) {
        throw new Error("exerciseId 또는 workoutId가 없습니다.");
      }
      return {
        ...detail,
        exerciseId: exercise?.id,
        workoutId: workout?.id,
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
