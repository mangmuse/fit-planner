import {
  overwriteWithServerExercises,
  syncToServerExercises,
} from "@/services/exercise.service";
import {
  overwriteWithServerRoutines,
  syncToServerRoutines,
} from "@/services/routine.service";
import {
  overwriteWithServerRoutineDetails,
  syncToServerRoutineDetails,
} from "@/services/routineDetail.service";
import {
  overwriteWithServerWorkouts,
  syncToServerWorkouts,
} from "@/services/workout.service";
import {
  overwriteWithServerWorkoutDetails,
  syncToServerWorkoutDetails,
} from "@/services/workoutDetail.service";

export const overWriteAllWithServerData = async (userId: string) => {
  await overwriteWithServerExercises(userId);

  await overwriteWithServerWorkouts(userId);
  await overwriteWithServerRoutines(userId);

  await overwriteWithServerWorkoutDetails(userId);
  await overwriteWithServerRoutineDetails(userId);
};

export const syncToServer = async (userId: string) => {
  await syncToServerExercises(userId);

  await syncToServerWorkouts();
  await syncToServerRoutines();

  await syncToServerWorkoutDetails();
  await syncToServerRoutineDetails();
};
