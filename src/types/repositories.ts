import { LocalWorkout } from "@/types/models";

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
  add: (toInsert: Omit<LocalWorkout, "id">) => Promise<number>; // id를 제외한 타입을 받을 수 있도록 Omit 사용 가능
  bulkAdd: (toInsert: Omit<LocalWorkout, "id">[]) => Promise<number>;
  update: (id: number, toUpdate: Partial<LocalWorkout>) => Promise<number>;
  delete: (id: number) => Promise<void>;
}
