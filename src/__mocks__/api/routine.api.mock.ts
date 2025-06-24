import { IRoutineApi } from "@/types/apis";

export const createMockRoutineApi = (): jest.Mocked<IRoutineApi> => ({
  fetchRoutinesFromServer: jest.fn(),
  postRoutinesToServer: jest.fn(),
});
