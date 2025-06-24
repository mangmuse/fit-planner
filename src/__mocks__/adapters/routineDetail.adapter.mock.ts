import { IRoutineDetailAdapter } from "@/types/adapters";

export const createMockRoutineDetailAdapter =
  (): jest.Mocked<IRoutineDetailAdapter> => ({
    getInitialRoutineDetail: jest.fn(),
    createRoutineDetail: jest.fn(),
    getNewRoutineDetails: jest.fn(),
    getAddSetToRoutineByLastSet: jest.fn(),
    mapPastWorkoutToRoutineDetail: jest.fn(),
    mapLocalRoutineDetailToServer: jest.fn(),
    cloneToCreateInput: jest.fn(),
  });
