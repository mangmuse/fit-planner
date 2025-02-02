import { User, Exercise } from "@prisma/client";

export type UserModel = User;
export type ExerciseModel = Exercise;

export type ModelWithStringDates<T> = Omit<T, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt?: string | null;
};

export type ClientUser = ModelWithStringDates<UserModel>;
export type ClientExerise = ModelWithStringDates<ExerciseModel> & {
  isBookmarked: boolean;
};
