jest.mock("@/lib/db", () => ({
  db: {
    workoutDetails: {
      where: jest.fn(),
      toArray: jest.fn(),
      bulkAdd: jest.fn(),
      bulkPut: jest.fn(),
      clear: jest.fn(),
      update: jest.fn(),
      get: jest.fn(),
      add: jest.fn(),
    },
  },
}));

jest.mock("@/api/workoutDetail.api", () => ({
  fetchWorkoutDetailsFromServer: jest
    .fn()
    .mockResolvedValue(mockServerWorkoutDetails),
}));
jest.mock("@/services/exercise.service", () => ({
  getExerciseWithServerId: jest.fn(),
}));
jest.mock("@/services/workout.service", () => ({
  getWorkoutWithServerId: jest.fn(),
}));
import { mockLocalExercises } from "@/__mocks__/exercise.mock";
import { mockLocalWorkouts } from "@/__mocks__/workout.mock";
import { mockServerWorkoutDetails } from "@/__mocks__/workoutDetail.mock";
import { db } from "@/lib/db";
import { getExerciseWithServerId } from "@/services/exercise.service";
import { getWorkoutWithServerId } from "@/services/workout.service";
import { overwriteWithServerWorkoutDetails } from "@/services/workoutDetail.service";

describe("workoutDetail.service", () => {
  const userId = "testUserId";
  describe("overwriteWithServerWorkoutDetails", () => {
    const exercise = {
      ...mockLocalExercises[1],
      createdAt: expect.any(String),
    };
    const workout = {
      ...mockLocalWorkouts[0],
      isSynced: true,
      createdAt: expect.any(String),
    };
    (getExerciseWithServerId as jest.Mock).mockResolvedValue(exercise);
    (getWorkoutWithServerId as jest.Mock).mockResolvedValue(workout);

    describe("서버에서 받은 데이터를 올바르게 매핑해서 localDB를 덮어쓴다", () => {
      it("서버에서 받은 데이터로 올바르게 getExerciseWithServerId와, getWorkoutWithServerId를 호출한다", async () => {
        await overwriteWithServerWorkoutDetails(userId);
        mockServerWorkoutDetails.forEach((detail) => {
          expect(getExerciseWithServerId).toHaveBeenCalledWith(
            detail.exerciseId
          );
          expect(getWorkoutWithServerId).toHaveBeenCalledWith(detail.workoutId);
        });
      });
      //
      it("workoutId, exerciseId, serverID를 매핑하여 clear와 bulkAdd를 호출한다", async () => {
        const details = mockServerWorkoutDetails.map((detail) => ({
          ...detail,
          id: undefined,
          serverId: detail.id,
          isSynced: true,
          exerciseId: exercise?.id,
          workoutId: workout?.id,
        }));

        await overwriteWithServerWorkoutDetails(userId);
        expect(db.workoutDetails.clear).toHaveBeenCalledTimes(1);
        expect(db.workoutDetails.bulkAdd).toHaveBeenCalledWith(details);
      });
    });
  });
});
