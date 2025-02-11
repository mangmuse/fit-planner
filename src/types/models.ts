import { expectType } from "tsd";
import { User, Exercise, WorkoutDetail, Workout } from "@prisma/client";
import { z } from "zod";

export const clientWorkoutSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
});

export const clientExerciseSchema = z.object({
  id: z.number(),
  category: z.string(),
  createdAt: z.string(),
  imageUrl: z.string(),
  isBookmarked: z.boolean(),
  isCustom: z.boolean(),
  name: z.string(),
  userId: z.string().nullable(),
  updatedAt: z.string().optional().nullable(),
});

export type UserModel = User;
export type ExerciseModel = Exercise;
export type ModelWithStringDates<T> = Omit<T, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt?: string | null;
};

export type ClientUser = ModelWithStringDates<UserModel>;
export type ClientExercise = z.infer<typeof testSchema>;
export type ClientWorkout = z.infer<typeof clientWorkoutSchema>;

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
  serverId: ClientWorkoutDetail["id"] | null;
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
