import { IWorkoutDetailApi } from "@/types/apis";

export const createMockWorkoutDetailApi = (): jest.Mocked<IWorkoutDetailApi> => ({
  fetchWorkoutDetailsFromServer: jest.fn(),
  postWorkoutDetailsToServer: jest.fn(),
});