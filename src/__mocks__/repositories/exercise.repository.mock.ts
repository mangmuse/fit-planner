import { IExerciseRepository } from "@/types/repositories";

export const createMockExerciseRepository =
  (): jest.Mocked<IExerciseRepository> =>
    ({
      add: jest.fn(),
      clear: jest.fn(),
      update: jest.fn(),
      bulkAdd: jest.fn(),
      bulkPut: jest.fn(),
      delete: jest.fn(),
      bulkDelete: jest.fn(),
      findAll: jest.fn(),
      findAllUnsynced: jest.fn(),
      findOneById: jest.fn(),
      findOneByServerId: jest.fn(),
    }) as unknown as jest.Mocked<IExerciseRepository>;
