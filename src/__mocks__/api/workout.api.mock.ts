import { IWorkoutApi } from "@/types/apis";

export const createMockWorkoutApi = (): jest.Mocked<IWorkoutApi> => ({
  fetchWorkoutsFromServer: jest.fn(),
  postWorkoutsToServer: jest.fn(),
});
