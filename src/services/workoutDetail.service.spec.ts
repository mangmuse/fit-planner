jest.mock("@/lib/db");
jest.mock("@/adapter/exercise.adapter");
jest.mock("@/adapter/workoutDetail.adapter");
jest.mock("@/api/workoutDetail.api");
jest.mock("@/services/exercise.service");
jest.mock("@/services/workout.service");
import { mockLocalExercises } from "@/__mocks__/exercise.mock";
import { mockLocalWorkouts } from "@/__mocks__/workout.mock";
import {
  mockLocalWorkoutDetails,
  mockPostWorkoutDetailsToServerResponse,
  mockServerWorkoutDetails,
} from "@/__mocks__/workoutDetail.mock";
import {
  convertLocalWorkoutDetailToServer,
  getAddSetToWorkoutByLastSet,
  getNewWorkoutDetails,
  getStartExerciseOrder,
} from "@/adapter/workoutDetail.adapter";
import {
  fetchWorkoutDetailsFromServer,
  postWorkoutDetailsToServer,
} from "@/api/workoutDetail.api";
import { db } from "@/lib/db";
import { getExerciseWithServerId } from "@/services/exercise.service";
import {
  addLocalWorkout,
  getWorkoutByUserIdAndDate,
  getWorkoutWithServerId,
} from "@/services/workout.service";
import {
  addLocalWorkoutDetailsByUserDate,
  addSetToWorkout,
  deleteWorkoutDetail,
  getLocalWorkoutDetails,
  overwriteWithServerWorkoutDetails,
  syncToServerWorkoutDetails,
  updateLocalWorkoutDetail,
} from "@/services/workoutDetail.service";
import { mockWhereEqualsToArray } from "@/util/dbMockUtils";

describe("workoutDetail.service", () => {
  const userId = "testUserId";
  const date = "testDate";
  const exercise = {
    ...mockLocalExercises[1],
    createdAt: expect.any(String),
  };
  const workout = {
    ...mockLocalWorkouts[0],
    isSynced: true,
    createdAt: expect.any(String),
  };
  const localDetails = mockLocalWorkoutDetails.map((detail) => ({
    ...detail,
    workoutId: detail.id,
  }));
  (fetchWorkoutDetailsFromServer as jest.Mock).mockResolvedValue(
    mockServerWorkoutDetails
  );
  (addLocalWorkout as jest.Mock).mockResolvedValue(localDetails[0]);
  (getNewWorkoutDetails as jest.Mock).mockReturnValue(localDetails);
  (getWorkoutByUserIdAndDate as jest.Mock).mockResolvedValue(localDetails[0]);
  (getStartExerciseOrder as jest.Mock).mockResolvedValue(1);
  (getExerciseWithServerId as jest.Mock).mockResolvedValue(exercise);
  (getWorkoutWithServerId as jest.Mock).mockResolvedValue(workout);

  describe("overwriteWithServerWorkoutDetails", () => {
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

  describe("addLocalWorkoutDetails", () => {
    const selectedExercises = [{ id: 1, name: "벤치프레스" }];
    it("매핑된 newDetails과 함께 bulkAdd를 호출한다", async () => {
      await addLocalWorkoutDetailsByUserDate(userId, date, selectedExercises);
      expect(db.workoutDetails.bulkAdd).toHaveBeenCalledWith(localDetails);
    });
  });

  describe("getLocalWorkoutDetails", () => {
    it("조건에 맞는 workout이 없는경우 workout을 생성한다", async () => {
      (getWorkoutByUserIdAndDate as jest.Mock).mockResolvedValueOnce(undefined);
      mockWhereEqualsToArray("workoutDetails", localDetails);
      await getLocalWorkoutDetails(userId, date);
      expect(addLocalWorkout).toHaveBeenCalledTimes(1);
    });
    it("해당 workout의 details를 반환한다", async () => {
      const result = await getLocalWorkoutDetails(userId, date);
      expect(result).toEqual(localDetails);
    });

    it("workout을 생성한 후에 workoutId가 존재하지 않으면 에러를 던진다", async () => {
      (getWorkoutByUserIdAndDate as jest.Mock).mockResolvedValueOnce(undefined);
      (addLocalWorkout as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(getLocalWorkoutDetails(userId, date)).rejects.toThrow(
        "workoutId를 가져오지 못했습니다"
      );
    });

    it("일치하는 workoutDetail이 없으면 빈 배열을 반환한다", async () => {
      mockWhereEqualsToArray("workoutDetails", [], true);

      const result = await getLocalWorkoutDetails(userId, date);
      expect(result).toEqual([]);
    });
  });

  describe("updateLocalWorkoutDetail", () => {
    it("입력받은 값을 업데이트한다", async () => {
      const updateInput = {
        id: 1,
        isSynced: false,
        isDone: true,
      };
      await updateLocalWorkoutDetail(updateInput);
      expect(db.workoutDetails.update).toHaveBeenCalledWith(1, updateInput);
    });

    it("입력받은 값의 id가 없는경우 에러를 던진다", async () => {
      const updateInput = {
        isSynced: false,
        isDone: true,
      };
      await expect(updateLocalWorkoutDetail(updateInput)).rejects.toThrow(
        "id가 없습니다"
      );
    });
  });

  describe("addSet", () => {
    const lastSet = { ...mockLocalWorkoutDetails[0], workoutId: 1 };
    const newSet = {
      ...lastSet,
      rpe: 0,
      serverId: null,
      isSynced: false,
      isDone: false,
      setOrder: lastSet.setOrder + 1,
      createdAt: expect.any(String),
    };
    (getAddSetToWorkoutByLastSet as jest.Mock).mockReturnValue(newSet);
    it("마지막 세트를 기반으로 무게, 횟수, 운동종류 등이 동일한 운동을 생성하며 id를 반환한다", async () => {
      (db.workoutDetails.add as jest.Mock).mockResolvedValue(newSet.id);
      const result = await addSetToWorkout(lastSet);
      expect(db.workoutDetails.add).toHaveBeenCalledWith(newSet);
      expect(result).toEqual(newSet.id);
    });
    it("", async () => {
      (getAddSetToWorkoutByLastSet as jest.Mock).mockReturnValueOnce(undefined);
      (db.workoutDetails.add as jest.Mock).mockResolvedValue(undefined);

      const result = await addSetToWorkout(lastSet);

      expect(result).toEqual(undefined);
    });
  });

  describe("deleteSet", () => {
    it("해당 detail을 삭제한다", async () => {
      await deleteWorkoutDetail(123);
      expect(db.workoutDetails.delete).toHaveBeenCalledWith(123);
    });
  });

  describe("syncToServerWorkoutDetails", () => {
    const localWorkout = { ...workout, isSynced: false };
    const localExercise = exercise;
    it("db의 serverId로 매핑된 unsynced workoutDetails를 postWorkoutDetailsToServer의 인자로 넘긴다", async () => {
      (db.workoutDetails.toArray as jest.Mock).mockResolvedValue(localDetails);
      (convertLocalWorkoutDetailToServer as jest.Mock).mockResolvedValue(
        mockLocalWorkoutDetails
      );
      (postWorkoutDetailsToServer as jest.Mock).mockResolvedValue(
        mockPostWorkoutDetailsToServerResponse
      );
      await syncToServerWorkoutDetails();
      expect(postWorkoutDetailsToServer).toHaveBeenCalledWith(
        mockLocalWorkoutDetails
      );
    });

    it("postWorkoutDetailsToServer의 반환값을 기반으로 매핑된 디테일을 업데이트한다", async () => {
      await syncToServerWorkoutDetails();
      mockPostWorkoutDetailsToServerResponse.updated.forEach((updated) => {
        expect(db.workoutDetails.update).toHaveBeenCalledWith(updated.localId, {
          serverId: updated.serverId,
          isSynced: true,
          exerciseId: localExercise.id,
          workoutId: localWorkout.id,
        });
      });
    });
    it("postWorkoutDetailsToServer가 빈 배열을 반환할 경우 즉시 리턴한다", async () => {
      (postWorkoutDetailsToServer as jest.Mock).mockResolvedValue({
        success: true,
        updated: [],
      });
      await syncToServerWorkoutDetails();
      expect(getExerciseWithServerId).not.toHaveBeenCalled();
      expect(getWorkoutWithServerId).not.toHaveBeenCalled();
      expect(db.workoutDetails.update).not.toHaveBeenCalled();
    });
  });
});
