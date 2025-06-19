import {
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
    details: LocalWorkoutDetail[] | LocalRoutineDetail[]
  ) => Promise<LocalWorkoutDetail | void>;
}

export interface IWorkoutDetailService
  extends IWorkoutDetailCoreService,
    IWorkoutDetailSyncService,
    IWorkoutDetailQueryService {}

// --- Workout ---
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

// --- Exercise ---
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
