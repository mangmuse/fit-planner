import { fetchWorkoutDetailsFromServer } from "@/api/workoutDetail";
import { db, getstartExerciseOrder } from "@/lib/db";
import { getExerciseName } from "@/lib/localExerciseService";
import { addLocalWorkout } from "@/lib/localWorkoutService";
import {
  ClientWorkoutDetail,
  LocalWorkout,
  LocalWorkoutDetail,
} from "@/types/models";

type NewWorkoutDetailInput = {
  workoutId: number;
  startOrder: number;
};

export const overwriteWithServerWorkoutDetails = async (userId: string) => {
  const serverData: ClientWorkoutDetail[] = await fetchWorkoutDetailsFromServer(
    userId
  );
  console.log(serverData);
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
  console.log(toInsert);
  await db.workoutDetails.clear();
  await db.workoutDetails.bulkAdd(toInsert);
};

const getNewDetails = async (
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

const getAddSetInputByLastSet = (lastSet: LocalWorkoutDetail) => {
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
