import {
  createNestedExercises,
  createNestedStructure,
} from "@/adapter/syncAll.adapter.";
import { syncAllToServer } from "@/app/api/syncAll.api";
import {
  exerciseService,
  routineDetailService,
  routineService,
  workoutDetailService,
  workoutService,
} from "@/lib/di";
import {
  LocalRoutine,
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
  NestedRoutine,
  NestedWorkout,
  Saved,
} from "@/types/models";

export const overWriteAllWithServerData = async (userId: string) => {
  await exerciseService.overwriteWithServerExercises(userId);

  await workoutService.overwriteWithServerWorkouts(userId);
  await routineService.overwriteWithServerRoutines(userId);

  await workoutDetailService.overwriteWithServerWorkoutDetails(userId);
  await routineDetailService.overwriteWithServerRoutineDetails(userId);
};

// export const syncToServer = async (userId: string) => {
//   // 반드시 exercise
//   // => workout => routine
//   // => workoutDetail => routineDetail
//   await exerciseService.syncToServerExercises(userId);

//   await workoutService.syncToServerWorkouts(userId);
//   await routineService.syncToServerRoutines(userId);

//   await workoutDetailService.syncToServerWorkoutDetails();
//   await routineDetailService.syncToServerRoutineDetails();
// };

export const overWriteToServer = async (userId: string) => {
  const exercises = await exerciseService.getAllLocalExercises(userId);
  const workouts = await workoutService.getAllWorkouts(userId);
  const routines = await routineService.getAllLocalRoutines(userId);

  const workoutIds = workouts.map((workout) => workout.id);
  const routineIds = routines.map((routine) => routine.id);

  const workoutDetails =
    await workoutDetailService.getAllLocalWorkoutDetailsByWorkoutIds(
      workoutIds
    );
  const routineDetails =
    await routineDetailService.getAllLocalRoutineDetailsByRoutineIds(
      routineIds
    );

  const nestedExercises = createNestedExercises(exercises);

  const nestedWorkouts: NestedWorkout[] = createNestedStructure(
    workouts,
    workoutDetails,
    "workoutId"
  );
  const nestedRoutines: NestedRoutine[] = createNestedStructure(
    routines,
    routineDetails,
    "routineId"
  );

  syncAllToServer({
    userId,
    nestedExercises,
    nestedWorkouts,
    nestedRoutines,
  });
};
