import { IExerciseService } from "@/types/services";

export const createMockExerciseService = (): jest.Mocked<IExerciseService> => ({
  syncPromise: null,
  getExerciseWithServerId: jest.fn(),
  getAllLocalExercises: jest.fn(),
  getExerciseWithLocalId: jest.fn(),
  addLocalExercise: jest.fn(),
  updateLocalExercise: jest.fn(),
  toggleLocalBookmark: jest.fn(),

  overwriteWithServerExercises: jest.fn(),
  syncExercisesFromServerLocalFirst: jest.fn(),
  syncFromServerIfNeeded: jest.fn(),
  // syncToServerExercises: jest.fn(),
});
