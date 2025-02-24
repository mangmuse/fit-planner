import {
  updateLocalWorkout,
  getWorkoutByUserIdAndDate,
} from "./workout.service";
jest.mock("@/lib/db");

jest.mock("@/api/workout.api", () => ({
  postWorkoutsToServer: jest
    .fn()
    .mockImplementation(async () => mockPostWorkoutsToServerResponse),
  fetchWorkoutFromServer: jest.fn(),
}));
import {
  mockLocalWorkouts,
  mockPostWorkoutsToServerResponse,
  mockServerWorkouts,
} from "@/__mocks__/workout.mock";
import {
  fetchWorkoutFromServer,
  postWorkoutsToServer,
} from "@/api/workout.api";
import { db } from "@/lib/db";
import {
  addLocalWorkout,
  getWorkoutWithServerId,
  overwriteWithServerWorkouts,
  syncToServerWorkouts,
} from "@/services/workout.service";
import { mockWhereEqualsFirst } from "@/util/dbMockUtils";

describe("workout.service", () => {
  const userId = "testUserId";
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getWorkoutByUserIdAndDate", () => {
    it("userId와 date 가 일치하는 workout을 반환한다", async () => {
      const mockWorkout = mockLocalWorkouts[0];
      mockWhereEqualsFirst("workouts", mockWorkout);

      const workout = await getWorkoutByUserIdAndDate(userId, "testDate");

      expect(workout).toEqual(mockWorkout);
    });

    it("일치하는 workout이 없으면 undefined를 반환한다", async () => {
      mockWhereEqualsFirst("workouts", undefined);
      const result = await getWorkoutByUserIdAndDate(userId, "testDate");
      expect(result).toBe(undefined);
    });
  });

  describe("getWorktoutWithServerId", () => {
    const localWorkout = mockLocalWorkouts[0];
    const serverId = "testServerId";
    it("해당되는 workout이 있을경우 해당 workout을 반환한다", async () => {
      (db.workouts.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(localWorkout),
        }),
      });
      const workout = await getWorkoutWithServerId(serverId);

      expect(workout).toEqual(localWorkout);
    });
    it("해당되는 workout이 없을경우 에러를 던진다", async () => {
      (db.workouts.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(undefined),
        }),
      });
      await expect(getWorkoutWithServerId(serverId)).rejects.toThrow(
        "일치하는 workout이 없습니다"
      );
    });
  });
  describe("getWorkoutWithLocalId", () => {
    const localWorkout = mockLocalWorkouts[0];
    const localId = "testServerId";
    it("해당되는 workout이 있을경우 해당 workout을 반환한다", async () => {
      mockWhereEqualsFirst("workouts", localWorkout);
      const workout = await getWorkoutWithServerId(localId);

      expect(workout).toEqual(localWorkout);
    });
    it("해당되는 workout이 없을경우 에러를 던진다", async () => {
      (db.workouts.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(undefined),
        }),
      });
      await expect(getWorkoutWithServerId(localId)).rejects.toThrow(
        "일치하는 workout이 없습니다"
      );
    });
  });
  describe("syncToServerWorkouts", () => {
    (db.workouts.toArray as jest.Mock).mockReturnValue(mockLocalWorkouts);

    const unsynced = mockLocalWorkouts.map((workout) => ({
      ...workout,
      isSynced: false,
    }));
    it("DB에서 isSynced가 false인 workout들을 postWorkoutToServer에 전달하며 호출한다", async () => {
      await syncToServerWorkouts();
      expect(postWorkoutsToServer).toHaveBeenCalledWith(unsynced);
    });

    it("postWorkoutsToServer 의 반환값을 기반으로 serverId와 isSynced를 업데이트한다", async () => {
      await syncToServerWorkouts();
      mockPostWorkoutsToServerResponse.updated.map((workout) => {
        const { serverId, localId } = workout;
        expect(db.workouts.update).toHaveBeenCalledWith(localId, {
          serverId,
          isSynced: true,
        });
      });
    });
    it("db 반환값이 없을경우 빈배열과 함께 postWorkoutsToServer 를 호출해 서버와 통신하며 빈배열을 반환하기 때문에 update는 호출되지 않는다", async () => {
      (db.workouts.toArray as jest.Mock).mockReturnValue([]);
      (postWorkoutsToServer as jest.Mock).mockResolvedValueOnce({
        success: true,
        updated: [],
      });
      await syncToServerWorkouts();
      expect(postWorkoutsToServer).toHaveBeenCalledWith([]);
      expect(db.workouts.update).not.toHaveBeenCalled();
    });
  });

  describe("overwriteWithServerWorkouts", () => {
    it("fetchWorkoutFromServer 의 반환값을 로컬데이터 형식으로 변환하여 workouts를 덮어씌운다", async () => {
      (fetchWorkoutFromServer as jest.Mock).mockResolvedValueOnce(
        mockServerWorkouts
      );

      const toInsert = mockServerWorkouts.map((workout) => ({
        id: undefined,
        userId: workout.userId,
        serverId: workout.id,
        date: workout.date,
        isSynced: true,
        status: "EMPTY",

        createdAt: workout.createdAt,
        updatedAt: workout.updatedAt,
      }));

      await overwriteWithServerWorkouts(userId);

      expect(db.workouts.clear).toHaveBeenCalledTimes(1);
      expect(db.workouts.bulkAdd).toHaveBeenCalledWith(toInsert);
    });

    it("fetchWorkoutFromServer이 빈 배열을 반환할 경우에는 clear와 bulkAdd를 호출하지 않고 함수를 종료한다, ", async () => {
      (fetchWorkoutFromServer as jest.Mock).mockResolvedValueOnce([]);
      await overwriteWithServerWorkouts(userId);

      expect(db.workouts.clear).not.toHaveBeenCalled();
      expect(db.workouts.bulkAdd).not.toHaveBeenCalled();
    });
  });

  describe("addLocalWorkout", () => {
    const date = "testDate";
    it("조건에 해당되는 workout이 있다면 그 workout을 반환한다", async () => {
      const mockworkout = mockLocalWorkouts[0];
      (db.workouts.where as jest.Mock).mockReturnValueOnce({
        equals: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockReturnValueOnce(mockworkout),
        }),
      });
      const result = await addLocalWorkout(userId, date);
      expect(db.workouts.add).not.toHaveBeenCalled();
      expect(result).toEqual(mockworkout);
    });

    it("조건에 해당되는 workout이 없다면 입력받은 userId와 date를 기반으로 workout을 생성하며 해당 workout을 반환한다", async () => {
      const mockWorkout = mockLocalWorkouts[0];
      (db.workouts.where as jest.Mock).mockReturnValueOnce({
        equals: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockReturnValueOnce(undefined),
        }),
      });
      (db.workouts.where as jest.Mock).mockReturnValueOnce({
        equals: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockReturnValueOnce({ ...mockWorkout }),
        }),
      });

      (db.workouts.add as jest.Mock).mockResolvedValueOnce(mockWorkout.id);

      const result = await addLocalWorkout(userId, date);
      expect(db.workouts.add).toHaveBeenCalledWith({
        userId,
        date,
        status: "EMPTY" as const,
        createdAt: expect.any(String),
        isSynced: false,
        serverId: null,
      });
      expect(result).toEqual(mockWorkout);
    });
  });

  describe("deleteLocalWorkout", () => {
    it("id가 일치하는 workout을 업데이트한다", async () => {
      await updateLocalWorkout({ id: 1, status: "PLANNED" });

      expect(db.workouts.update).toHaveBeenCalledWith(1, {
        id: 1,
        status: "PLANNED",
      });
    });

    it("업데이트에 실패할 경우 에러를 던진다", async () => {
      (db.workouts.update as jest.Mock).mockRejectedValueOnce(new Error());
      await expect(
        updateLocalWorkout({ id: 1, status: "PLANNED" })
      ).rejects.toThrow("Workout 업데이트에 실패했습니다");
    });
  });
});
