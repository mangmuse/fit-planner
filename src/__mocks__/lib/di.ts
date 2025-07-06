import type {
  IExerciseApi,
  IWorkoutApi,
  IWorkoutDetailApi,
  IRoutineApi,
  IRoutineDetailApi,
  ISyncAllApi,
} from "@/types/apis";
import type {
  IExerciseRepository,
  IWorkoutRepository,
  IWorkoutDetailRepository,
  IRoutineRepository,
  IRoutineDetailRepository,
} from "@/types/repositories";
import type {
  IExerciseService,
  IWorkoutService,
  IWorkoutDetailService,
  IRoutineService,
  IRoutineDetailService,
  ISyncAllService,
} from "@/types/services";
import type {
  IExerciseAdapter,
  IWorkoutDetailAdapter,
  IRoutineDetailAdapter,
  ISyncAllAdapter,
} from "@/types/adapters";

function createMockFromInterface<T>(): jest.Mocked<T> {
  return new Proxy({} as jest.Mocked<T>, {
    get: (target, prop) => {
      if (!(prop in target)) {
        target[prop as keyof T] = jest.fn() as jest.Mocked<T>[keyof T];
      }
      return target[prop as keyof T];
    },
  });
}

export const mockExerciseApi = createMockFromInterface<IExerciseApi>();
export const mockWorkoutApi = createMockFromInterface<IWorkoutApi>();
export const mockWorkoutDetailApi =
  createMockFromInterface<IWorkoutDetailApi>();
export const mockRoutineApi = createMockFromInterface<IRoutineApi>();
export const mockRoutineDetailApi =
  createMockFromInterface<IRoutineDetailApi>();
export const mockSyncAllApi = createMockFromInterface<ISyncAllApi>();

export const mockExerciseRepository =
  createMockFromInterface<IExerciseRepository>();
export const mockWorkoutRepository =
  createMockFromInterface<IWorkoutRepository>();
export const mockRoutineRepository =
  createMockFromInterface<IRoutineRepository>();
export const mockRoutineDetailRepository =
  createMockFromInterface<IRoutineDetailRepository>();
export const mockWorkoutDetailRepository =
  createMockFromInterface<IWorkoutDetailRepository>();

export const mockExerciseAdapter = createMockFromInterface<IExerciseAdapter>();
export const mockWorkoutDetailAdapter =
  createMockFromInterface<IWorkoutDetailAdapter>();
export const mockRoutineDetailAdapter =
  createMockFromInterface<IRoutineDetailAdapter>();
export const mockSyncAllAdapter = createMockFromInterface<ISyncAllAdapter>();

export const mockExerciseService = createMockFromInterface<IExerciseService>();
export const mockWorkoutService = createMockFromInterface<IWorkoutService>();
export const mockRoutineService = createMockFromInterface<IRoutineService>();
export const mockRoutineDetailService =
  createMockFromInterface<IRoutineDetailService>();
export const mockWorkoutDetailService =
  createMockFromInterface<IWorkoutDetailService>();
export const mockSyncAllService = createMockFromInterface<ISyncAllService>();

export const mockDI = {
  // API
  exerciseApi: mockExerciseApi,
  workoutApi: mockWorkoutApi,
  workoutDetailApi: mockWorkoutDetailApi,
  routineApi: mockRoutineApi,
  routineDetailApi: mockRoutineDetailApi,
  syncAllApi: mockSyncAllApi,

  // Repository
  exerciseRepository: mockExerciseRepository,
  routineRepository: mockRoutineRepository,
  routineDetailRepository: mockRoutineDetailRepository,
  workoutRepository: mockWorkoutRepository,
  workoutDetailRepository: mockWorkoutDetailRepository,

  // Adapter
  exerciseAdapter: mockExerciseAdapter,
  workoutDetailAdapter: mockWorkoutDetailAdapter,
  routineDetailAdapter: mockRoutineDetailAdapter,
  syncAllAdapter: mockSyncAllAdapter,

  // Service
  exerciseService: mockExerciseService,
  workoutService: mockWorkoutService,
  routineService: mockRoutineService,
  routineDetailService: mockRoutineDetailService,
  workoutDetailService: mockWorkoutDetailService,
  syncAllService: mockSyncAllService,
};
