import { expectType } from "tsd";
import { User, Exercise, WorkoutDetail, Workout } from "@prisma/client";
import { boolean, nullable, z } from "zod";
import { set } from "lodash";

export const clientWorkoutSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(),
  status: z.enum(["EMPTY", "PLANNED", "IN_PROGRESS", "COMPLETED"]),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
});

export const clientRoutineSchema = z.object({
  id: z.string(),
  userId: z.string(),
  description: z.string().nullable(),
  name: z.string(),
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
  exerciseMemo: z
    .object({
      fixed: z
        .object({
          content: z.string(),
          createdAt: z.string(),
          updatedAt: z.string().nullable(),
        })
        .nullable(),
      daily: z.array(
        z.object({
          date: z.string(),
          content: z.string(),
          createdAt: z.string(),
          updatedAt: z.string().nullable(),
        })
      ),
    })
    .nullable(),
  name: z.string(),
  unit: z.enum(["kg", "lbs"]),
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
  setType: z.enum(["NORMAL", "WARMUP", "DROP", "FAILURE", "AMRAP"]),
  rpe: z.number().nullable(),
  reps: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().optional().nullable(),
});

export const clientRoutineDetailSchema = z.object({
  id: z.string(),
  routineId: z.string(),
  exerciseId: z.number(),
  exerciseName: z.string(),
  weight: z.number().nullable(),
  reps: z.number().nullable(),
  rpe: z.number().nullable(),
  exerciseOrder: z.number(),
  setOrder: z.number(),
  setType: z.enum(["NORMAL", "WARMUP", "DROP", "FAILURE", "AMRAP"]),
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
  status: z.enum(["EMPTY", "PLANNED", "IN_PROGRESS", "COMPLETED"]),
});

export const localRoutineSchema = z.object({
  id: z.number().optional(),
  serverId: z.string().nullable(),
  isSynced: z.boolean(),
  userId: z.string(),
  description: z.string().nullable(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
});

export const localExerciseSchema = z.object({
  imageUrl: z.string(),
  createdAt: z.string(),
  isCustom: z.boolean(),
  isBookmarked: z.boolean(),
  name: z.string(),
  category: z.string(),
  serverId: z.number().nullable(),
  unit: z.enum(["kg", "lbs"]),
  exerciseMemo: z
    .object({
      fixed: z
        .object({
          content: z.string(),
          createdAt: z.string(),
          updatedAt: z.string().nullable(),
        })
        .nullable(),
      daily: z.array(
        z.object({
          date: z.string(),
          content: z.string(),
          createdAt: z.string(),
          updatedAt: z.string().nullable(),
        })
      ),
    })
    .nullable(),
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
  setType: z.enum(["NORMAL", "WARMUP", "DROP", "FAILURE", "AMRAP"]),
  exerciseOrder: z.number(),
  exerciseName: z.string(),
  exerciseId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().optional().nullable(),
});

export const localRoutineDetailSchema = z.object({
  id: z.number().optional(),
  serverId: z.string().nullable(),
  routineId: z.number(),
  weight: z.number().nullable(),
  reps: z.number().nullable(),
  rpe: z.number().nullable(),
  isSynced: z.boolean(),
  setOrder: z.number(),
  setType: z.enum(["NORMAL", "WARMUP", "DROP", "FAILURE", "AMRAP"]),
  exerciseOrder: z.number(),
  exerciseName: z.string(),
  exerciseId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().optional().nullable(),
});

// expectType<>({} as LocalExercise);

export type Saved<T extends { id?: number }> = Omit<T, "id"> & { id: number };

export type ModelWithStringDates<T> = Omit<T, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt?: string | null;
};

export type ClientUser = ModelWithStringDates<User>;
export type ClientExercise = z.infer<typeof clientExerciseSchema>;
export type ClientWorkout = z.infer<typeof clientWorkoutSchema>;
export type ClientRoutine = z.infer<typeof clientRoutineSchema>;
export type ClientWorkoutDetail = z.infer<typeof clientWorkoutDetailSchema>;
export type ClientRoutineDetail = z.infer<typeof clientRoutineDetailSchema>;

export type LocalExercise = z.infer<typeof localExerciseSchema>;
export type LocalWorkout = z.infer<typeof localWorkoutSchema>;
export type LocalRoutine = z.infer<typeof localRoutineSchema>;
export type LocalWorkoutDetail = z.infer<typeof localWorkoutDetailSchema>;
export type LocalRoutineDetail = z.infer<typeof localRoutineDetailSchema>;

export type LocalWorkoutDetailWithServerWorkoutId = Omit<
  LocalWorkoutDetail,
  "workoutId"
> & {
  workoutId: string;
};
export type LocalRoutineDetailWithServerRoutineId = Omit<
  LocalRoutineDetail,
  "routineId"
> & {
  routineId: string;
};

export type AddLocalWorkoutDetailInput = {
  exerciseId: number;
  workoutId: number;
  exerciseOrder: number;
  exerciseName: string;
  setOrder: number;
};

export interface LocalBase {
  id?: number;
}
