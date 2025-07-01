import { IRoutineService } from "@/types/services";

export const createMockRoutineService = (): jest.Mocked<IRoutineService> => ({
  // --- Core Service ---
  getAllLocalRoutines: jest.fn(),
  getRoutineByServerId: jest.fn(),
  getRoutineByLocalId: jest.fn(),
  addLocalRoutine: jest.fn(),
  updateLocalRoutine: jest.fn(),
  deleteLocalRoutine: jest.fn(),

  // --- Sync Service ---
  syncToServerRoutines: jest.fn(),
  overwriteWithServerRoutines: jest.fn(),
});
