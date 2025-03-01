jest.mock("@/lib/db");
jest.mock("@/api/exercise.api");

jest.mock("@/adapter/exercise.adapter", () => ({
  mergeServerExerciseData: jest
    .fn()
    .mockImplementation(() => mockLocalExercises),
}));

import {
  getUnsyncedExercises,
  syncToServerExercises,
  updateExercise,
} from "./exercise.service";
import {
  mockLocalExercises,
  mockPostExercisesToServerResponse,
  mockServerResponseExercises,
} from "@/__mocks__/exercise.mock";
import {
  getAllLocalExercises,
  getExerciseWithServerId,
  overwriteWithServerExercises,
  syncExercisesFromServerLocalFirst,
  toggleLocalBookmark,
} from "@/services/exercise.service";
import { db } from "@/lib/db";
import { LocalExercise } from "@/types/models";
import {
  fetchExercisesFromServer,
  postExercisesToServer,
} from "@/api/exercise.api";

describe("exercise.service", () => {
  const getUnsyncedMock = () => {
    return mockLocalExercises.map((ex) => ({
      ...ex,
      isSynced: false,
    }));
  };
  describe("getExerciseWithServerId", () => {
    it("serverId에 해당하는 exercise가 존재하면 반환한다", async () => {
      const exercise = { ...mockLocalExercises[2] };
      (db.exercises.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(exercise),
        }),
      });

      const result = await getExerciseWithServerId(103);
      expect(result).toEqual(exercise);
    });
    it("일치하는 exercise가 없 으면 에러를 던진다", async () => {
      (db.exercises.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(undefined),
        }),
      });

      await expect(getExerciseWithServerId(101)).rejects.toThrow(
        "일치하는 exercise가 없습니다"
      );
    });
  });

  describe("getExerciseWithLocalId", () => {
    it("localId에 해당하는 exercise가 존재하면 반환한다", async () => {
      const exercise = { ...mockLocalExercises[0] };
      (db.exercises.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(exercise),
        }),
      });

      const result = await getExerciseWithServerId(1);
      expect(result).toEqual(exercise);
    });
    it("일치하는 exercise가 없으면 에러를 던진다", async () => {
      (db.exercises.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValueOnce(undefined),
        }),
      });

      await expect(getExerciseWithServerId(101)).rejects.toThrow(
        "일치하는 exercise가 없습니다"
      );
    });
  });

  describe("overwriteWithServerExercises", () => {
    it("서버에서 받아온 데이터로 DB를 덮어씌운다", async () => {
      (fetchExercisesFromServer as jest.Mock).mockResolvedValue(
        mockServerResponseExercises
      );
      await overwriteWithServerExercises("testUserId");
      const expectedInsert = mockServerResponseExercises.map((ex) => ({
        ...ex,
        serverId: ex.id,
        isSynced: true,
      }));
      expect(db.exercises.clear).toHaveBeenCalled();
      expect(db.exercises.bulkAdd).toHaveBeenCalledWith(expectedInsert);
    });
  });

  describe("syncExercisesFromServerLocalFirst", () => {
    it("서버에서 받아온 데이터와 로컬 데이터를 머지하여 DB를 덮어씌운다", async () => {
      await syncExercisesFromServerLocalFirst("testUserId");

      expect(db.exercises.clear).toHaveBeenCalled();
      expect(db.exercises.bulkPut).toHaveBeenCalledWith(mockLocalExercises);
    });
  });

  describe("getAllLocalExercises", () => {
    it("로컬DB의 exercises 항목을 배열로 반환한다", async () => {
      (db.exercises.toArray as jest.Mock).mockResolvedValue(mockLocalExercises);
      const result = await getAllLocalExercises();
      expect(result).toEqual(mockLocalExercises);
    });

    it("일치하는 항목이 없으면 빈 배열을 반환한다", async () => {
      (db.exercises.toArray as jest.Mock).mockResolvedValue([]);
      const result = await getAllLocalExercises();
      expect(result).toEqual([]);
    });
  });

  describe("toggleLocalBookmark", () => {
    it("isBookmarked값을 토글하고, isSynced=false, updatedAt을 업데이트 한다", async () => {
      await toggleLocalBookmark(1, true);
      expect(db.exercises.update).toHaveBeenCalledWith(1, {
        isBookmarked: true,
        isSynced: false,
        updatedAt: expect.any(String),
      } as Partial<LocalExercise>);
    });
  });

  describe("getUnsyncedExercises", () => {
    const mockExercises = getUnsyncedMock();
    it("로컬DB의 exercises 테이블에서 isSynced가 false 인 값을 배열로 반환한다 ", async () => {
      (db.exercises.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockExercises),
        }),
      });
      const result = await getUnsyncedExercises();

      expect(result).toEqual(mockExercises);
    });

    it("해당되는 값이 없을경우 빈 배열을 반환한다", async () => {
      (db.exercises.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      });
      const result = await getUnsyncedExercises();

      expect(result).toEqual([]);
    });
  });

  describe("syncToServerExercises", () => {
    const mockExercises = getUnsyncedMock();
    const userId = "testUserId";

    it("로컬 DB에서 isSynced가 false인 항목과 userId 와 함께 postExercisesToServer를 호출한다", async () => {
      (db.exercises.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockExercises),
        }),
      });

      (postExercisesToServer as jest.Mock).mockResolvedValue(
        mockPostExercisesToServerResponse
      );

      await syncToServerExercises(userId);

      expect(postExercisesToServer).toHaveBeenCalledWith(mockExercises, userId);
    });

    it("postExercisesToServer의 반환값을 localdb에 저장하고 isSycned와 serverId를 업데이트한다", async () => {
      (db.exercises.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockExercises),
        }),
      });

      (postExercisesToServer as jest.Mock).mockResolvedValue(
        mockPostExercisesToServerResponse
      );

      await syncToServerExercises(userId);

      mockPostExercisesToServerResponse.updated.map(({ serverId, localId }) => {
        expect(db.exercises.update).toHaveBeenCalledWith(localId, {
          isSynced: true,
          serverId,
        });
      });
    });
  });

  describe("updateExercise", () => {
    const updateInput: Partial<LocalExercise> = {
      id: 1,
      unit: "lbs",
      isBookmarked: true,
    };
    beforeEach(() => {});
    it("제공받은 데이터로 올바르게 업데이트한다", async () => {
      await updateExercise(updateInput);
      expect(db.exercises.update).toHaveBeenCalledWith(updateInput.id, {
        ...updateInput,
        isSynced: false,
      });
    });
    it("올바르게 id가 제공되지 않으면 에러를 던진다", async () => {
      const { id, ...rest } = updateInput;
      await expect(updateExercise({ ...rest })).rejects.toThrow(
        "id가 없습니다"
      );
    });
    it("해당하는 id의 데이터가 없으면 0을 반환한다", async () => {
      (db.exercises.update as jest.Mock).mockReturnValueOnce(0);
      const result = await updateExercise(updateInput);
      expect(result).toBe(0);
    });
  });
});
