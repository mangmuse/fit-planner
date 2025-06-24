import { IRoutineDetailRepository } from "@/types/repositories";

export const createMockRoutineDetailRepository = (): jest.Mocked<IRoutineDetailRepository> => ({
  add: jest.fn(),
  clear: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByServerId: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findAllByRoutineId: jest.fn(),
  bulkAdd: jest.fn(),
  bulkPut: jest.fn(),
  bulkDelete: jest.fn(),
});