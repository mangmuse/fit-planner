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
  getInitialRoutineDetail(weightUnit?: "kg" | "lbs"): LocalRoutineDetail;

  createRoutineDetail(
    override: Partial<LocalRoutineDetail>,
    weightUnit?: "kg" | "lbs"
  ): LocalRoutineDetail;

  getNewRoutineDetails(
    selectedExercises: { id: number | undefined; name: string }[],
    input: RD_NewInput,
    weightUnit?: "kg" | "lbs"
  ): LocalRoutineDetail[];

  getAddSetToRoutineByLastSet(
    lastSet: LocalRoutineDetail,
    weightUnit?: "kg" | "lbs"
  ): LocalRoutineDetail;

  mapPastWorkoutToRoutineDetail(
    pastWorkoutDetail: LocalWorkoutDetail,
    targetRoutineId: number,
    newExerciseOrder: number,
    weightUnit?: "kg" | "lbs"
  ): LocalRoutineDetail;

  mapLocalRoutineDetailToServer(
    detail: LocalRoutineDetail,
    exercise: LocalExercise,
    routine: LocalRoutine
  ): LocalRoutineDetailWithServerRoutineId;

  cloneToCreateInput(
    input: LocalRoutineDetail,
    newRoutineId: number,
    weightUnit?: "kg" | "lbs"
  ): LocalRoutineDetail;
}

// --- WorkoutDetail Adapter Interface ---
export interface IWorkoutDetailAdapter {
  getInitialWorkoutDetail(weightUnit?: "kg" | "lbs"): LocalWorkoutDetail;
  createWorkoutDetail(
    override: Partial<LocalWorkoutDetail>,
    weightUnit?: "kg" | "lbs"
  ): LocalWorkoutDetail;
  mapPastWorkoutToWorkoutDetail(
    pastWorkoutDetail: LocalWorkoutDetail,
    targetWorkoutId: number,
    newExerciseOrder: number,
    weightUnit?: "kg" | "lbs"
  ): LocalWorkoutDetail;
  getAddSetToWorkoutByLastSet(
    lastSet: LocalWorkoutDetail,
    weightUnit?: "kg" | "lbs"
  ): LocalWorkoutDetail;
  getNewWorkoutDetails(
    selectedExercises: { id: number | undefined; name: string }[],
    input: WD_NewInput,
    weightUnit?: "kg" | "lbs"
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
    workoutId: LocalWorkoutDetail["workoutId"],
    weightUnit?: "kg" | "lbs"
  ): LocalWorkoutDetail;
}
