import { exerciseService } from "@/services/exercise.service";
import {
  overwriteWithServerRoutines,
  syncToServerRoutines,
} from "@/services/routine.service";
import { routineDetailService } from "@/services/routineDetail.service";
import { workoutService } from "@/services/workout.service";
import { workoutDetailService } from "@/services/workoutDetail.service";

export const overWriteAllWithServerData = async (userId: string) => {
  await exerciseService.overwriteWithServerExercises(userId);

  await workoutService.overwriteWithServerWorkouts(userId);
  await overwriteWithServerRoutines(userId);

  await workoutDetailService.overwriteWithServerWorkoutDetails(userId);
  await routineDetailService.overwriteWithServerRoutineDetails(userId);
};

export const syncToServer = async (userId: string) => {
  await exerciseService.syncToServerExercises(userId);

  await workoutService.syncToServerWorkouts();
  await syncToServerRoutines();

  await workoutDetailService.syncToServerWorkoutDetails();
  await routineDetailService.syncToServerRoutineDetails();
};
