import { IWorkoutDetailAdapter } from "@/types/adapters";

export const createMockWorkoutDetailAdapter = (): jest.Mocked<IWorkoutDetailAdapter> => ({
  convertRoutineDetailToWorkoutDetailInput: jest.fn(),
  createOverwriteWorkoutDetailPayload: jest.fn(),
  createWorkoutDetail: jest.fn(),
  getAddSetToWorkoutByLastSet: jest.fn(),
  getInitialWorkoutDetail: jest.fn(),
  getNewWorkoutDetails: jest.fn(),
  mapLocalWorkoutDetailToServer: jest.fn(),
  mapPastWorkoutToWorkoutDetail: jest.fn(),
});