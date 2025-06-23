import { IWorkoutRepository } from "@/types/repositories";

export const createMockWorkoutRepository =
  (): jest.Mocked<IWorkoutRepository> => ({
    add: jest.fn(),
    clear: jest.fn(),
    update: jest.fn(),
    bulkAdd: jest.fn(),
    bulkPut: jest.fn(),
    delete: jest.fn(),
    bulkDelete: jest.fn(),
    findAll: jest.fn(),
    findAllByDateRangeExcludeEmpty: jest.fn(),
    findAllByUserIdOrderByDate: jest.fn(),
    findOneById: jest.fn(),
    findOneByServerId: jest.fn(),
    findOneByUserIdAndDate: jest.fn(),
  });
