import { IRoutineDetailApi } from "@/types/apis";

export const createMockRoutineDetailApi = (): jest.Mocked<IRoutineDetailApi> => ({
  fetchRoutineDetailsFromServer: jest.fn(),
  postRoutineDetailsToServer: jest.fn(),
});