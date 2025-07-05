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

  const workoutIds = workouts.map((workout) => workout.id) as number[];
  const routineIds = routines.map((routine) => routine.id) as number[];

  const workoutDetails =
    await workoutDetailService.getAllLocalWorkoutDetailsByWorkoutIds(
      workoutIds
    );
  const routineDetails =
    await routineDetailService.getAllLocalRoutineDetailsByRoutineIds(
      routineIds
    );

  console.log("exercises:::::", exercises);
  console.log("workouts:::", workouts);
  console.log("routines:::", routines);
  console.log("workoutDetails:::", workoutDetails);
  console.log("routineDetails:::", routineDetails);
};
// 각 db에서 데이터 가져오기
// workout과 routine의 경우 detail을 nested구조로 변환 (adapter)
// 던지기
