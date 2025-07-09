import {
  LocalRoutine,
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
  Saved,
} from "@/types/models";
import { ClientExercise, LocalExercise } from "@/types/models";

// --- SyncAll ---

export interface ISyncAllService {
  overWriteAllWithServerData: (userId: string) => Promise<void>;
  overWriteToServer: (userId: string) => Promise<void>;
}

// --- WorkoutDetail ---
export interface IWorkoutDetailCoreService {
  getLocalWorkoutDetails: (
    userId: string,
    date: string
  ) => Promise<Saved<LocalWorkoutDetail>[]>;
  getLocalWorkoutDetailsByWorkoutId: (
    workoutId: number
  ) => Promise<Saved<LocalWorkoutDetail>[]>;
  getStartExerciseOrder: (workoutId: number) => Promise<number>;
  addLocalWorkoutDetail: (detailInput: LocalWorkoutDetail) => Promise<void>;
  addLocalWorkoutDetailsByWorkoutId: (
    workoutId: number,
    startOrder: number,
    selectedExercises: { id: number; name: string }[]
  ) => Promise<number>;
  addPastWorkoutDetailsToWorkout: (
    mappedDetails: LocalWorkoutDetail[]
  ) => Promise<void>;
  addSetToWorkout: (
    lastSet: Saved<LocalWorkoutDetail>
  ) => Promise<Saved<LocalWorkoutDetail>>;
  addLocalWorkoutDetailsByUserDate: (
    userId: string,
    date: string,
    selectedExercises: { id: number | undefined; name: string }[]
  ) => Promise<number>;
  updateLocalWorkoutDetail: (
    updateWorkoutInput: Partial<LocalWorkoutDetail>
  ) => Promise<void>;
  getAllLocalWorkoutDetailsByWorkoutIds: (
    workoutIds: number[]
  ) => Promise<Saved<LocalWorkoutDetail>[]>;
  updateWorkoutDetails: (updatedDetails: LocalWorkoutDetail[]) => Promise<void>;
  deleteWorkoutDetail: (lastSetId: number) => Promise<void>;
  deleteWorkoutDetails: (details: LocalWorkoutDetail[]) => Promise<void>;
}

export interface IWorkoutDetailSyncService {
  overwriteWithServerWorkoutDetails: (userId: string) => Promise<void>;
  // syncToServerWorkoutDetails: () => Promise<void>;
}

export interface IWorkoutDetailQueryService {
  getWorkoutGroupByWorkoutDetail: (
    detail: LocalWorkoutDetail
  ) => Promise<LocalWorkoutDetail[]>;
  getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder: (
    workoutId: number,
    exerciseOrder: number
  ) => Promise<Saved<LocalWorkoutDetail>[]>;
  getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs: (
    pairs: { workoutId: number; exerciseOrder: number }[]
  ) => Promise<Saved<LocalWorkoutDetail>[]>;
  getLatestWorkoutDetailByDetail: (
    detail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>
  ) => Promise<Saved<LocalWorkoutDetail> | void>;

  getLocalWorkoutDetailsByWorkoutIdAndExerciseId: (
    workoutId: number,
    exerciseId: number
  ) => Promise<Saved<LocalWorkoutDetail>[]>;
}

export interface IWorkoutDetailService
  extends IWorkoutDetailCoreService,
    IWorkoutDetailSyncService,
    IWorkoutDetailQueryService {}

// === Workout ===
export interface IWorkoutService {
  // --- Core Service ---
  getAllWorkouts: (userId: string) => Promise<Saved<LocalWorkout>[]>;
  getWorkoutWithServerId: (
    serverId: string
  ) => Promise<Saved<LocalWorkout> | void>;
  getWorkoutWithLocalId: (id: number) => Promise<Saved<LocalWorkout> | void>;
  getWorkoutByUserIdAndDate: (
    userId: string,
    date: string
  ) => Promise<Saved<LocalWorkout> | void>;
  addLocalWorkout: (
    userId: string,
    date: string
  ) => Promise<Saved<LocalWorkout>>;
  updateLocalWorkout: (workout: Partial<LocalWorkout>) => Promise<void>;
  deleteLocalWorkout: (workoutId: number) => Promise<void>;

  // --- Sync Service ---
  // syncToServerWorkouts: (userId: string) => Promise<void>;
  overwriteWithServerWorkouts: (userId: string) => Promise<void>;

  // --- Query Service ---
  getThisMonthWorkouts: (
    startDate: string,
    endDate: string
  ) => Promise<Saved<LocalWorkout>[]>;
}

// ==== Exercise ====
export interface IExerciseService {
  syncPromise: Promise<void> | null;
  // --- Core Service ---
  getExerciseWithServerId: (
    serverId: number
  ) => Promise<Saved<LocalExercise> | void>;
  getAllLocalExercises: (userId: string) => Promise<Saved<LocalExercise>[]>;
  getExerciseWithLocalId: (id: number) => Promise<Saved<LocalExercise> | void>;
  addLocalExercise: (args: {
    name: string;
    category: string;
    userId: string;
  }) => Promise<void>;
  updateLocalExercise: (updateInput: Partial<LocalExercise>) => Promise<number>;
  toggleLocalBookmark: (localId: number, nextValue: boolean) => Promise<void>;

  // --- Sync Service ---
  overwriteWithServerExercises: (userId: string) => Promise<void>;
  syncExercisesFromServerLocalFirst: (userId: string) => Promise<void>;
  syncFromServerIfNeeded: (userId: string) => Promise<void>;
  // syncToServerExercises: (userId: string) => Promise<void>;
}

// ==== Routine ====
export interface IRoutineService {
  // --- Core Service ---
  getAllLocalRoutines: (userId: string) => Promise<Saved<LocalRoutine>[]>;
  getRoutineByServerId: (
    serverId: string
  ) => Promise<Saved<LocalRoutine> | void>;
  getRoutineByLocalId: (localId: number) => Promise<Saved<LocalRoutine> | void>;
  addLocalRoutine: (args: {
    userId: string;
    name: string;
    description?: string;
  }) => Promise<number>;
  updateLocalRoutine: (routine: Partial<LocalRoutine>) => Promise<void>;
  updateLocalRoutineUpdatedAt: (routineId: number) => Promise<void>;
  deleteLocalRoutine: (routineId: number) => Promise<void>;

  // --- Sync Service ---
  // syncToServerRoutines: (userId: string) => Promise<void>;
  overwriteWithServerRoutines: (userId: string) => Promise<void>;
}

// --- RoutineDetail Service Interface ---
export interface IRoutineDetailService {
  // --- Core Service ---
  getLocalRoutineDetails: (
    routineId: number
  ) => Promise<Saved<LocalRoutineDetail>[]>;
  getAllLocalRoutineDetailsByRoutineIds: (
    routineIds: number[]
  ) => Promise<Saved<LocalRoutineDetail>[]>;

  addLocalRoutineDetail: (detailInput: LocalRoutineDetail) => Promise<void>;
  addSetToRoutine: (
    lastSet: Saved<LocalRoutineDetail>
  ) => Promise<Saved<LocalRoutineDetail>>;
  addLocalRoutineDetailsByWorkoutId: (
    routineId: number,
    startOrder: number,
    selectedExercises: { id: number; name: string }[]
  ) => Promise<void>;
  addPastWorkoutDetailsToRoutine: (
    mappedDetails: LocalRoutineDetail[]
  ) => Promise<void>;
  cloneRoutineDetailWithNewRoutineId: (
    originalDetail: Saved<LocalRoutineDetail>,
    newRoutineId: number
  ) => Promise<void>;
  updateLocalRoutineDetail: (
    updateInput: Partial<LocalRoutineDetail>
  ) => Promise<void>;
  deleteRoutineDetail: (detailId: number) => Promise<void>;
  deleteRoutineDetails: (details: Saved<LocalRoutineDetail>[]) => Promise<void>;

  // --- Sync Service ---
  // syncToServerRoutineDetails: () => Promise<void>;
  overwriteWithServerRoutineDetails: (userId: string) => Promise<void>;
}
