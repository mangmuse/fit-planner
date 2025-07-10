import { IWorkoutDetailRepository } from "@/types/repositories";

export const createMockWorkoutDetailRepository =
  (): jest.Mocked<IWorkoutDetailRepository> => ({
    add: jest.fn(),
    clear: jest.fn(),
    update: jest.fn(),
    bulkAdd: jest.fn(),
    bulkPut: jest.fn(),
    delete: jest.fn(),
    bulkDelete: jest.fn(),
    findAllByWorkoutIds: jest.fn(),
    findAllByWorkoutId: jest.fn(),
    findAllByWorkoutIdAndExerciseOrder: jest.fn(),
    findAllByWorkoutIdAndExerciseOrderPairs: jest.fn(),
    findAllByWorkoutIdOrderByExerciseOrder: jest.fn(),
    findAllDoneByExerciseId: jest.fn(),
    findAllByWorkoutIdAndExerciseId: jest.fn(),
  });
