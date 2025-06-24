import { IExerciseApi } from "@/types/apis";

export const createMockExerciseApi = (): jest.Mocked<IExerciseApi> => ({
  fetchExercisesFromServer: jest.fn(),
  postExercisesToServer: jest.fn(),
});
