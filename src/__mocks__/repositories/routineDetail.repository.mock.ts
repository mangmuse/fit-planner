import { IRoutineDetailRepository } from "@/types/repositories";

export const createMockRoutineDetailRepository =
  (): jest.Mocked<IRoutineDetailRepository> => ({
    add: jest.fn(),
    clear: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOneById: jest.fn(),
    findAllByRoutineId: jest.fn(),
    findAllByRoutineIds: jest.fn(),
    bulkAdd: jest.fn(),
    bulkPut: jest.fn(),
    bulkDelete: jest.fn(),
  });
