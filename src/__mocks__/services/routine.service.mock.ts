import { IRoutineService } from "@/types/services";

export const createMockRoutineService = (): jest.Mocked<IRoutineService> => ({
  // Core
  getRoutineByLocalId: jest.fn(),
  getAllRoutinesByUserId: jest.fn(),
  addLocalRoutine: jest.fn(),
  updateLocalRoutine: jest.fn(),
  getRoutineByServerId: jest.fn(),
  addLocalRoutineWithWorkout: jest.fn(),
  deleteLocalRoutine: jest.fn(),
  
  // Sync
  overwriteWithServerRoutines: jest.fn(),
  syncToServerRoutines: jest.fn(),
});