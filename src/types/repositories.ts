import {
  LocalExercise,
  LocalRoutine,
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
} from "@/types/models";

export interface IWorkoutRepository {
  clear: () => Promise<void>;
  findAll: () => Promise<LocalWorkout[]>;
  findOneById: (workoutId: number) => Promise<LocalWorkout | undefined>;
  findOneByServerId: (serverId: string) => Promise<LocalWorkout | undefined>;
  findOneByUserIdAndDate: (
    userId: string,
    date: string
  ) => Promise<LocalWorkout | undefined>;
  findAllByUserIdOrderByDate: (userId: string) => Promise<LocalWorkout[]>;
  findAllByDateRangeExcludeEmpty: (
    startDate: string,
    endDate: string
  ) => Promise<LocalWorkout[]>;
  add: (toInsert: Omit<LocalWorkout, "id">) => Promise<number>;
  bulkAdd: (toInsert: Omit<LocalWorkout, "id">[]) => Promise<number>;
  update: (id: number, toUpdate: Partial<LocalWorkout>) => Promise<number>;
  delete: (id: number) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
}

export interface IRoutineRepository {
  clear: () => Promise<void>;
  findOneById: (id: number) => Promise<LocalRoutine | undefined>;
  findOneByServerId: (serverId: string) => Promise<LocalRoutine | undefined>;
  findAll: () => Promise<LocalRoutine[]>;
  findAllByUserId: (userId: string) => Promise<LocalRoutine[]>;
  add: (toInsert: Omit<LocalRoutine, "id">) => Promise<number>;
  bulkAdd: (toInsert: Omit<LocalRoutine, "id">[]) => Promise<number>;
  update: (id: number, toUpdate: Partial<LocalRoutine>) => Promise<number>;
  delete: (id: number) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
}

export interface IExerciseRepository {
  clear: () => Promise<void>;
  findOneById: (id: number) => Promise<LocalExercise | undefined>;
  findOneByServerId: (serverId: number) => Promise<LocalExercise | undefined>;
  findAll: () => Promise<LocalExercise[]>;
  findAllUnsynced: () => Promise<LocalExercise[]>;
  add: (toInsert: Omit<LocalExercise, "id">) => Promise<number>;
  bulkAdd: (toInsert: Omit<LocalExercise, "id">[]) => Promise<number>;
  update: (id: number, toUpdate: Partial<LocalExercise>) => Promise<number>;
  bulkPut: (toUpdate: LocalExercise[]) => Promise<number>;
  delete: (id: number) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
}

export interface IRoutineDetailRepository {
  clear: () => Promise<void>;
  findAllByRoutineId: (routineId: number) => Promise<LocalRoutineDetail[]>;
  add: (toInsert: Omit<LocalRoutineDetail, "id">) => Promise<number>;
  findAll: () => Promise<LocalRoutineDetail[]>;
  bulkAdd: (toInsert: Omit<LocalRoutineDetail, "id">[]) => Promise<number>;
  update: (
    id: number,
    toUpdate: Partial<LocalRoutineDetail>
  ) => Promise<number>;
  delete: (id: number) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
}

export interface IWorkoutDetailRepository {
  clear: () => Promise<void>;
  findAll: () => Promise<LocalWorkoutDetail[]>;
  findAllByWorkoutId: (workoutId: number) => Promise<LocalWorkoutDetail[]>;
  findAllByWorkoutIdOrderByExerciseOrder: (
    workoutId: number
  ) => Promise<LocalWorkoutDetail[]>;
  findAllByWorkoutIdAndExerciseOrder: (
    workoutId: number,
    exerciseOrder: number
  ) => Promise<LocalWorkoutDetail[]>;
  findAllDoneByExerciseId: (
    exerciseId: number
  ) => Promise<LocalWorkoutDetail[]>;
  add: (toInsert: Omit<LocalWorkoutDetail, "id">) => Promise<number>;
  bulkAdd: (toInsert: Omit<LocalWorkoutDetail, "id">[]) => Promise<number>;
  update: (
    detailId: number,
    toUpdate: Partial<LocalWorkoutDetail>
  ) => Promise<number>;
  bulkPut: (toUpdate: LocalWorkoutDetail[]) => Promise<number>;
  delete: (detailId: number) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
}
