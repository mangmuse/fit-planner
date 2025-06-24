import { IRoutineRepository } from "@/types/repositories";

export const createMockRoutineRepository =
  (): jest.Mocked<IRoutineRepository> => ({
    add: jest.fn(),
    clear: jest.fn(),
    update: jest.fn(),
    bulkAdd: jest.fn(),
    bulkPut: jest.fn(),
    delete: jest.fn(),
    bulkDelete: jest.fn(),
    findAll: jest.fn(),
    findAllByUserId: jest.fn(),
    findOneById: jest.fn(),
    findOneByServerId: jest.fn(),
  });
