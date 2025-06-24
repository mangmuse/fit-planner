import {
  LocalRoutine,
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
} from "@/types/models";
import { ClientExercise, LocalExercise } from "@/types/models";

// --- WorkoutDetail ---
export interface IWorkoutDetailCoreService {
  getLocalWorkoutDetails: (
    userId: string,
    date: string
  ) => Promise<LocalWorkoutDetail[]>;
  getLocalWorkoutDetailsByWorkoutId: (
    workoutId: number
  ) => Promise<LocalWorkoutDetail[]>;
  getStartExerciseOrder: (workoutId: number) => Promise<number>;
  addLocalWorkoutDetail: (detailInput: LocalWorkoutDetail) => Promise<void>;
  addLocalWorkoutDetailsByWorkoutId: (
    workoutId: number,
    startOrder: number,
    selectedExercises: { id: number; name: string }[]
  ) => Promise<number>;
  addSetToWorkout: (lastSet: LocalWorkoutDetail) => Promise<number>;
  addLocalWorkoutDetailsByUserDate: (
    userId: string,
    date: string,
    selectedExercises: { id: number | undefined; name: string }[]
  ) => Promise<number>;
  updateLocalWorkoutDetail: (
    updateWorkoutInput: Partial<LocalWorkoutDetail>
  ) => Promise<void>;
  updateWorkoutDetails: (updatedDetails: LocalWorkoutDetail[]) => Promise<void>;
  deleteWorkoutDetail: (lastSetId: number) => Promise<void>;
  deleteWorkoutDetails: (details: LocalWorkoutDetail[]) => Promise<void>;
}

export interface IWorkoutDetailSyncService {
  overwriteWithServerWorkoutDetails: (userId: string) => Promise<void>;
  syncToServerWorkoutDetails: () => Promise<void>;
}

export interface IWorkoutDetailQueryService {
  getWorkoutGroupByWorkoutDetail: (
    detail: LocalWorkoutDetail
  ) => Promise<LocalWorkoutDetail[]>;
  getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder: (
    workoutId: number,
    exerciseOrder: number
  ) => Promise<LocalWorkoutDetail[]>;
  getLatestWorkoutDetailByExerciseId: (
    detail: LocalWorkoutDetail | LocalRoutineDetail
  ) => Promise<LocalWorkoutDetail | void>;
}

export interface IWorkoutDetailService
  extends IWorkoutDetailCoreService,
    IWorkoutDetailSyncService,
    IWorkoutDetailQueryService {}

// === Workout ===
export interface IWorkoutService {
  // --- Core Service ---
  getAllWorkouts: (userId: string) => Promise<LocalWorkout[]>;
  getWorkoutWithServerId: (serverId: string) => Promise<LocalWorkout | void>;
  getWorkoutWithLocalId: (id: number) => Promise<LocalWorkout | void>;
  getWorkoutByUserIdAndDate: (
    userId: string,
    date: string
  ) => Promise<LocalWorkout | void>;
  addLocalWorkout: (userId: string, date: string) => Promise<LocalWorkout>;
  updateLocalWorkout: (workout: Partial<LocalWorkout>) => Promise<void>;
  deleteLocalWorkout: (workoutId: number) => Promise<void>;

  // --- Sync Service ---
  syncToServerWorkouts: () => Promise<void>;
  overwriteWithServerWorkouts: (userId: string) => Promise<void>;

  // --- Query Service ---
  getThisMonthWorkouts: (
    startDate: string,
    endDate: string
  ) => Promise<LocalWorkout[]>;
}

// ==== Exercise ====
export interface IExerciseService {
  // --- Core Service ---
  getExerciseWithServerId: (serverId: number) => Promise<LocalExercise | void>;
  getAllLocalExercises: () => Promise<LocalExercise[]>;
  getExerciseWithLocalId: (id: number) => Promise<LocalExercise | void>;
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
  syncToServerExercises: (userId: string) => Promise<void>;
}

// ==== Routine ====
export interface IRoutineService {
  // --- Core Service ---
  getAllLocalRoutines: (userId: string) => Promise<LocalRoutine[]>;
  getRoutineByServerId: (serverId: string) => Promise<LocalRoutine | void>;
  getRoutineByLocalId: (localId: number) => Promise<LocalRoutine | void>;
  addLocalRoutine: (args: {
    userId: string;
    name: string;
    description?: string;
  }) => Promise<number>;
  updateLocalRoutine: (routine: Partial<LocalRoutine>) => Promise<void>;
  deleteLocalRoutine: (routineId: number) => Promise<void>;

  // --- Sync Service ---
  syncToServerRoutines: () => Promise<void>;
  overwriteWithServerRoutines: (userId: string) => Promise<void>;
}

// --- RoutineDetail Service Interface ---
export interface IRoutineDetailService {
  // --- Core Service ---
  getLocalRoutineDetails: (routineId: number) => Promise<LocalRoutineDetail[]>;
  addLocalRoutineDetail: (detailInput: LocalRoutineDetail) => Promise<void>;
  addSetToRoutine: (lastSet: LocalRoutineDetail) => Promise<number>;
  addLocalRoutineDetailsByWorkoutId: (
    routineId: number,
    startOrder: number,
    selectedExercises: { id: number; name: string }[]
  ) => Promise<void>;
  cloneRoutineDetailWithNewRoutineId: (
    originalDetail: LocalRoutineDetail,
    newRoutineId: number
  ) => Promise<void>;
  updateLocalRoutineDetail: (
    updateInput: Partial<LocalRoutineDetail>
  ) => Promise<void>;
  deleteRoutineDetail: (detailId: number) => Promise<void>;
  deleteRoutineDetails: (details: LocalRoutineDetail[]) => Promise<void>;

  // --- Sync Service ---
  syncToServerRoutineDetails: () => Promise<void>;
  overwriteWithServerRoutineDetails: (userId: string) => Promise<void>;
}
