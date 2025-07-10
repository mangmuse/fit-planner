import {
  LocalExercise,
  LocalRoutine,
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
  Saved,
} from "@/types/models";

export interface IWorkoutRepository {
  clear: () => Promise<void>;
  findOneById: (workoutId: number) => Promise<Saved<LocalWorkout> | undefined>;
  findOneByServerId: (
    serverId: string
  ) => Promise<Saved<LocalWorkout> | undefined>;
  findOneByUserIdAndDate: (
    userId: string,
    date: string
  ) => Promise<Saved<LocalWorkout> | undefined>;
  findAllByUserIdOrderByDate: (
    userId: string
  ) => Promise<Saved<LocalWorkout>[]>;
  findAllByDateRangeExcludeEmpty: (
    startDate: string,
    endDate: string
  ) => Promise<Saved<LocalWorkout>[]>;
  add: (toInsert: Omit<LocalWorkout, "id">) => Promise<number>;
  bulkAdd: (toInsert: Omit<LocalWorkout, "id">[]) => Promise<number>;
  update: (id: number, toUpdate: Partial<LocalWorkout>) => Promise<number>;
  bulkPut: (toUpdate: LocalWorkout[]) => Promise<number>;
  delete: (id: number) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
}

export interface IRoutineRepository {
  clear: () => Promise<void>;
  findOneById: (id: number) => Promise<Saved<LocalRoutine> | undefined>;
  findOneByServerId: (
    serverId: string
  ) => Promise<Saved<LocalRoutine> | undefined>;
  findAll: (userId: string) => Promise<Saved<LocalRoutine>[]>;
  findAllByUserId: (userId: string) => Promise<Saved<LocalRoutine>[]>;
  add: (toInsert: Omit<LocalRoutine, "id">) => Promise<number>;
  bulkAdd: (toInsert: Omit<LocalRoutine, "id">[]) => Promise<number>;
  update: (id: number, toUpdate: Partial<LocalRoutine>) => Promise<number>;
  bulkPut: (toUpdate: LocalRoutine[]) => Promise<number>;
  delete: (id: number) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
}

export interface IExerciseRepository {
  clear: () => Promise<void>;
  findOneById: (id: number) => Promise<Saved<LocalExercise> | undefined>;
  findOneByServerId: (
    serverId: number
  ) => Promise<Saved<LocalExercise> | undefined>;
  findAll: (userId: string) => Promise<Saved<LocalExercise>[]>;
  findAllUnsynced: () => Promise<Saved<LocalExercise>[]>;
  add: (toInsert: Omit<LocalExercise, "id">) => Promise<number>;
  bulkAdd: (toInsert: Omit<LocalExercise, "id">[]) => Promise<number>;
  update: (id: number, toUpdate: Partial<LocalExercise>) => Promise<number>;
  bulkPut: (toUpdate: LocalExercise[]) => Promise<number>;
  delete: (id: number) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
}

export interface IRoutineDetailRepository {
  clear: () => Promise<void>;
  findOneById: (id: number) => Promise<Saved<LocalRoutineDetail> | undefined>;
  findAllByRoutineId: (
    routineId: number
  ) => Promise<Saved<LocalRoutineDetail>[]>;
  findAllByRoutineIds: (
    routineIds: number[]
  ) => Promise<Saved<LocalRoutineDetail>[]>;
  add: (toInsert: Omit<LocalRoutineDetail, "id">) => Promise<number>;
  // findAll: () => Promise<LocalRoutineDetail[]>;
  bulkAdd: (toInsert: Omit<LocalRoutineDetail, "id">[]) => Promise<number>;
  update: (
    id: number,
    toUpdate: Partial<LocalRoutineDetail>
  ) => Promise<number>;
  bulkPut: (toUpdate: LocalRoutineDetail[]) => Promise<number>;
  delete: (id: number) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
}

export interface IWorkoutDetailRepository {
  clear: () => Promise<void>;
  findAllByWorkoutIds: (
    workoutIds: number[]
  ) => Promise<Saved<LocalWorkoutDetail>[]>;

  findAllByWorkoutId: (
    workoutId: number
  ) => Promise<Saved<LocalWorkoutDetail>[]>;
  findAllByWorkoutIdOrderByExerciseOrder: (
    workoutId: number
  ) => Promise<Saved<LocalWorkoutDetail>[]>;
  findAllByWorkoutIdAndExerciseOrder: (
    workoutId: number,
    exerciseOrder: number
  ) => Promise<Saved<LocalWorkoutDetail>[]>;
  findAllByWorkoutIdAndExerciseOrderPairs: (
    pairs: { workoutId: number; exerciseOrder: number }[]
  ) => Promise<Saved<LocalWorkoutDetail>[]>;
  findAllDoneByExerciseId: (
    exerciseId: number
  ) => Promise<Saved<LocalWorkoutDetail>[]>;
  findAllByWorkoutIdAndExerciseId: (
    workoutId: number,
    exerciseId: number
  ) => Promise<Saved<LocalWorkoutDetail>[]>;
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
