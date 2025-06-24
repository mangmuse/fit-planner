import { IExerciseAdapter, IRoutineDetailAdapter } from "@/types/adapters";

export const createMockExerciseAdapter = (): jest.Mocked<IExerciseAdapter> => ({
  mergeServerExerciseData: jest.fn(),
});
