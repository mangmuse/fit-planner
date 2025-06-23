jest.mock("@/util/apiHelpers", () => ({
  __esModule: true,
  ...jest.requireActual("@/util/apiHelpers"),
  safeRequest: jest.fn(),
}));

import {
  createMockExercise,
  mockExercise,
  mockFetchExercisesResponse,
  mockpostExercisesResponse,
} from "@/__mocks__/exercise.mock";
import { ExerciseApi } from "@/api/exercise.api";

import { BASE_URL } from "@/constants";

import { IExerciseApi } from "@/types/apis";
import { ApiError, safeRequest } from "@/util/apiHelpers";

const mockedSafeRequest = safeRequest as jest.Mock;
describe("ExerciseApi", () => {
  let api: IExerciseApi;

  beforeEach(() => {
    api = new ExerciseApi();
    mockedSafeRequest.mockClear();
  });

  describe("fetchExercisesFromServer", () => {
    it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
      const userId = "12345";
      mockedSafeRequest.mockResolvedValue(mockFetchExercisesResponse);
      const result = await api.fetchExercisesFromServer(userId);
      expect(result).toEqual(mockFetchExercisesResponse.exercises);
    });

    it("올바른 URL 인자를 사용한다", async () => {
      const userId = "user-123";
      mockedSafeRequest.mockResolvedValue({ exercises: [] });

      await api.fetchExercisesFromServer(userId);

      expect(mockedSafeRequest).toHaveBeenCalledWith(
        expect.stringContaining(`userId=${userId}`),
        expect.anything(),
        expect.anything()
      );
    });

    it("실패시 safeRequest가 던진 에러를 그대로 전달한다", async () => {
      const mockError = new ApiError(500, "서버터짐");
      mockedSafeRequest.mockRejectedValue(mockError);

      await expect(api.fetchExercisesFromServer("user-123")).rejects.toThrow(
        mockError
      );
    });
  });

  describe("postExercisesToServer", () => {
    it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
      const unSynced = [createMockExercise({ isSynced: false })];
      const userId = "user-123";
      mockedSafeRequest.mockResolvedValue(mockpostExercisesResponse);
      const result = await api.postExercisesToServer(unSynced, userId);
      expect(result).toBe(mockpostExercisesResponse);
    });

    it("올바른 URL과 인자를 사용하여 safeRequest를 호출한다", async () => {
      const unsynced = [createMockExercise({ isSynced: false })];
      const userId = "user-123";

      mockedSafeRequest.mockResolvedValue(mockpostExercisesResponse);

      await api.postExercisesToServer(unsynced, userId);

      expect(mockedSafeRequest).toHaveBeenCalledWith(
        expect.stringContaining(`${BASE_URL}/api/exercises/sync`),
        expect.objectContaining({
          body: JSON.stringify({ unsynced, userId }),
        }),
        expect.anything()
      );
    });
    it("실패시 safeRequest가 던진 에러를 그대로 전달한다", async () => {
      const unsynced = [createMockExercise({ isSynced: false })];
      const userId = "user-123";
      const mockError = new ApiError(422, "데이터 이상함");

      mockedSafeRequest.mockRejectedValue(mockError);

      await expect(api.postExercisesToServer(unsynced, userId)).rejects.toThrow(
        mockError
      );
    });
  });
});
