import { User, Exercise, WorkoutDetail } from "@prisma/client";

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
export type ClientWorkoutDetail = ModelWithStringDates<WorkoutDetail> & {
  exerciseName: string;
};

export type LocalExercise = Omit<ClientExercise, "id"> & {
  serverId: ClientExercise["id"] | null;
  id: number;
  isSynced: boolean;
};
