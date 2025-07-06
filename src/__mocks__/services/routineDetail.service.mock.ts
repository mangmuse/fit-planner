import { IRoutineDetailService } from "@/types/services";

export const createMockRoutineDetailService =
  (): jest.Mocked<IRoutineDetailService> => ({
    addLocalRoutineDetail: jest.fn(),
    addLocalRoutineDetailsByWorkoutId: jest.fn(),
    addPastWorkoutDetailsToRoutine: jest.fn(),
    addSetToRoutine: jest.fn(),
    cloneRoutineDetailWithNewRoutineId: jest.fn(),
    deleteRoutineDetail: jest.fn(),
    deleteRoutineDetails: jest.fn(),
    getAllLocalRoutineDetailsByRoutineIds: jest.fn(),
    getLocalRoutineDetails: jest.fn(),
    overwriteWithServerRoutineDetails: jest.fn(),
    updateLocalRoutineDetail: jest.fn(),
  });
