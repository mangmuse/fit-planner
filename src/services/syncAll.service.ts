import {
  exerciseService,
  routineDetailService,
  routineService,
  workoutDetailService,
  workoutService,
} from "@/lib/di";

export const overWriteAllWithServerData = async (userId: string) => {
  await exerciseService.overwriteWithServerExercises(userId);

  await workoutService.overwriteWithServerWorkouts(userId);
  await routineService.overwriteWithServerRoutines(userId);

  await workoutDetailService.overwriteWithServerWorkoutDetails(userId);
  await routineDetailService.overwriteWithServerRoutineDetails(userId);
};

export const syncToServer = async (userId: string) => {
  // 반드시 exercise
  // => workout => routine
  // => workoutDetail => routineDetail
  await exerciseService.syncToServerExercises(userId);

  await workoutService.syncToServerWorkouts();
  await routineService.syncToServerRoutines();

  await workoutDetailService.syncToServerWorkoutDetails();
  await routineDetailService.syncToServerRoutineDetails();
};
