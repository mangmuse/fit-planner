import { expectType } from "tsd";
import { User, Exercise, WorkoutDetail, Workout } from "@prisma/client";
import { boolean, nullable, z } from "zod";

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

export const clientWorkoutDetailSchema = z.object({
  id: z.string(),
  exerciseId: z.number(),
  exerciseName: z.string(),
  exerciseOrder: z.number(),
  isDone: z.boolean(),
  setOrder: z.number(),
  workoutId: z.string(),
  weight: z.number().nullable(),
  rpe: z.number().nullable(),
  reps: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().optional().nullable(),
});

export const localWorkoutSchema = z.object({
  serverId: z.string().nullable(),
  updatedAt: z.string().optional().nullable(),
  id: z.number().optional(),
  userId: z.string(),
  createdAt: z.string(),
  date: z.string(),
  isSynced: z.boolean(),
});

export const localExerciseSchema = z.object({
  imageUrl: z.string(),
  createdAt: z.string(),
  isCustom: z.boolean(),
  isBookmarked: z.boolean(),
  name: z.string(),
  category: z.string(),
  serverId: z.number().nullable(),
  id: z.number().optional(),
  updatedAt: z.string().nullable().optional(),
  isSynced: z.boolean(),
  userId: z.string().nullable(),
});

export const localWorkoutDetailSchema = z.object({
  id: z.number().optional(),
  serverId: z.string().nullable(),
  workoutId: z.number(),
  weight: z.number().nullable(),
  reps: z.number().nullable(),
  rpe: z.number().nullable(),
  isDone: z.boolean(),
  isSynced: z.boolean(),
  setOrder: z.number(),
  exerciseOrder: z.number(),
  exerciseName: z.string(),
  exerciseId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().optional().nullable(),
});

// expectType<>({} as LocalExercise);
export type ModelWithStringDates<T> = Omit<T, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt?: string | null;
};

export type ClientUser = ModelWithStringDates<User>;
export type ClientExercise = z.infer<typeof clientExerciseSchema>;
export type ClientWorkout = z.infer<typeof clientWorkoutSchema>;
export type ClientWorkoutDetail = z.infer<typeof clientWorkoutDetailSchema>;

export type LocalExercise = z.infer<typeof localExerciseSchema>;
export type LocalWorkout = z.infer<typeof localWorkoutSchema>;
export type LocalWorkoutDetail = z.infer<typeof localWorkoutDetailSchema>;

export type AddLocalWorkoutDetailInput = {
  exerciseId: number;
  workoutId: number;
  exerciseOrder: number;
  exerciseName: string;
  setOrder: number;
};
