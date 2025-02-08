import { User, Exercise, WorkoutDetail, Workout } from "@prisma/client";

export type UserModel = User;
export type ExerciseModel = Exercise;

export type ModelWithStringDates<T> = Omit<T, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt?: string | null;
};

export type ClientUser = ModelWithStringDates<UserModel>;
export type ClientExercise = ModelWithStringDates<ExerciseModel> & {
  isBookmarked: boolean;
};

export type ClientWorkout = ModelWithStringDates<Workout>;
export type ClientWorkoutDetail = ModelWithStringDates<WorkoutDetail> & {
  exerciseName: string;
};

export type LocalExercise = Omit<ClientExercise, "id"> & {
  serverId: ClientExercise["id"] | null;
  id?: number;
  isSynced: boolean;
};

export type LocalWorkoutDetail = Omit<
  ClientWorkoutDetail,
  "id" | "workoutId"
> & {
  serverId: ClientExercise["id"] | null;
  id?: number;
  isSynced: boolean;
  workoutId: number;
};

export type LocalWorkout = Omit<ClientWorkout, "id" | "date"> & {
  serverId: ClientWorkout["id"] | null;
  id?: number;
  isSynced: boolean;
  date: string;
};

export type AddLocalWorkoutDetailInput = {
  exerciseId: number;
  workoutId: number;
  exerciseOrder: number;
  exerciseName: string;
  setOrder: number;
};
