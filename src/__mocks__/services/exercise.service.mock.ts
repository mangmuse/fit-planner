import { IExerciseService } from "@/types/services";

export const createMockExerciseService = (): jest.Mocked<IExerciseService> => ({
  // --- Core Service ---
  getAllExercises: jest.fn(),
  getBookmarkedExercises: jest.fn(),
  toggleBookmark: jest.fn(),
  getExerciseWithLocalId: jest.fn(),
  getExerciseWithServerId: jest.fn(),
  addLocalExercise: jest.fn(),
  updateLocalExercise: jest.fn(),
  deleteLocalExercise: jest.fn(),

  // --- Sync Service ---
  syncToServerExercises: jest.fn(),
  overwriteWithServerExercises: jest.fn(),
});