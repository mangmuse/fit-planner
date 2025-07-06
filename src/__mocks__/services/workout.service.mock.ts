import { IWorkoutService } from "@/types/services";

export const createMockWorkoutService = (): jest.Mocked<IWorkoutService> => {
  return {
    addLocalWorkout: jest.fn(),
    deleteLocalWorkout: jest.fn(),
    getAllWorkouts: jest.fn(),
    getThisMonthWorkouts: jest.fn(),
    getWorkoutByUserIdAndDate: jest.fn(),
    getWorkoutWithLocalId: jest.fn(),
    getWorkoutWithServerId: jest.fn(),
    overwriteWithServerWorkouts: jest.fn(),
    updateLocalWorkout: jest.fn(),
  };
};
