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
    findAll: jest.fn(),
    findAllByWorkoutId: jest.fn(),
    findAllByWorkoutIdAndExerciseOrder: jest.fn(),
    findAllByWorkoutIdOrderByExerciseOrder: jest.fn(),
    findAllDoneByExerciseId: jest.fn(),
  });
