import {
  ClientExercise,
  ClientWorkoutDetail,
  LocalExercise,
  LocalRoutine,
  LocalRoutineDetail,
  LocalRoutineDetailWithServerRoutineId,
  LocalWorkout,
  LocalWorkoutDetail,
  LocalWorkoutDetailWithServerWorkoutId,
  NestedExercise,
  Saved,
} from "./models";

export type WD_NewInput = {
  workoutId: number;
  startOrder: number;
};

export type RD_NewInput = {
  routineId: number;
  startOrder: number;
};

// --- SyncAll Adapter --- //

export interface ISyncAllAdapter {
  createNestedStructure: <
    P extends number,
    T extends { id: P },
    K extends PropertyKey,
    U extends Record<K, P>,
  >(
    parents: T[],
    children: U[],
    foreignKey: K
  ) => (T & { details: U[] })[];

  createNestedExercises: (
    exercises: Saved<LocalExercise>[]
  ) => NestedExercise[];
}

export interface IExerciseAdapter {
  mergeServerExerciseData: (
    serverData: ClientExercise[],
    localData: LocalExercise[]
  ) => LocalExercise[];
}

export interface IRoutineDetailAdapter {
  getInitialRoutineDetail(): LocalRoutineDetail;

  createRoutineDetail(
    override: Partial<LocalRoutineDetail>
  ): LocalRoutineDetail;

  getNewRoutineDetails(
    selectedExercises: { id: number | undefined; name: string }[],
    input: RD_NewInput
  ): LocalRoutineDetail[];

  getAddSetToRoutineByLastSet(lastSet: LocalRoutineDetail): LocalRoutineDetail;

  mapPastWorkoutToRoutineDetail(
    pastWorkoutDetail: LocalWorkoutDetail,
    targetRoutineId: number,
    newExerciseOrder: number
  ): LocalRoutineDetail;

  mapLocalRoutineDetailToServer(
    detail: LocalRoutineDetail,
    exercise: LocalExercise,
    routine: LocalRoutine
  ): LocalRoutineDetailWithServerRoutineId;

  cloneToCreateInput(
    input: LocalRoutineDetail,
    newRoutineId: number
  ): LocalRoutineDetail;
}

// --- WorkoutDetail Adapter Interface ---
export interface IWorkoutDetailAdapter {
  getInitialWorkoutDetail(): LocalWorkoutDetail;
  createWorkoutDetail(
    override: Partial<LocalWorkoutDetail>
  ): LocalWorkoutDetail;
  mapPastWorkoutToWorkoutDetail(
    pastWorkoutDetail: LocalWorkoutDetail,
    targetWorkoutId: number,
    newExerciseOrder: number
  ): LocalWorkoutDetail;
  getAddSetToWorkoutByLastSet(lastSet: LocalWorkoutDetail): LocalWorkoutDetail;
  getNewWorkoutDetails(
    selectedExercises: { id: number | undefined; name: string }[],
    input: WD_NewInput
  ): LocalWorkoutDetail[];
  mapLocalWorkoutDetailToServer(
    detail: LocalWorkoutDetail,
    relatedExercise: LocalExercise,
    relatedWorkout: LocalWorkout
  ): LocalWorkoutDetailWithServerWorkoutId;
  createOverwriteWorkoutDetailPayload(
    detail: ClientWorkoutDetail,
    exercise: LocalExercise,
    workout: LocalWorkout
  ): LocalWorkoutDetail;
  convertRoutineDetailToWorkoutDetailInput(
    routineDetail: LocalRoutineDetail,
    workoutId: LocalWorkoutDetail["workoutId"]
  ): LocalWorkoutDetail;
}
