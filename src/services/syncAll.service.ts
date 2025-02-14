import {
  overwriteWithServerExercises,
  syncToServerExercises,
} from "@/services/exercise.service";
import {
  overwriteWithServerWorkouts,
  syncToServerWorkouts,
} from "@/services/workout.service";
import {
  overwriteWithServerWorkoutDetails,
  syncToServerWorkoutDetails,
} from "@/services/workoutDetail.service";

export const overWriteAllWithWerverData = async (userId: string) => {
  await overwriteWithServerExercises(userId);
  await overwriteWithServerWorkouts(userId);
  await overwriteWithServerWorkoutDetails(userId);
};

export const syncToServer = async (userId: string) => {
  await syncToServerExercises(userId);
  await syncToServerWorkouts();
  await syncToServerWorkoutDetails();
};
