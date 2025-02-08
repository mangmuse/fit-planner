import { db, getstartExerciseOrder } from "@/lib/db";
import { getExerciseName } from "@/lib/localExerciseService";
import { addLocalWorkout } from "@/lib/localWorkoutService";
import { LocalWorkoutDetail } from "@/types/models";

type NewWorkoutDetailInput = {
  workoutId: number;
  startOrder: number;
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
      weight: null,
      rpe: null,
      reps: null,
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
