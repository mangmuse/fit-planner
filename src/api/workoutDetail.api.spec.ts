jest.mock("@/util/apiHelpers", () => ({
  __esModule: true,
  ...jest.requireActual("@/util/apiHelpers"),
  safeRequest: jest.fn(),
}));

import {
  mockFetchWorkoutDetailsResponse,
  mockPostWorkoutDetailsToServerResponse,
  mockWorkoutDetail,
} from "@/__mocks__/workoutDetail.mock";
import { WorkoutDetailApi } from "@/api/workoutDetail.api";
import { BASE_URL } from "@/constants";
import { IWorkoutDetailApi } from "@/types/apis";
import { ApiError, safeRequest } from "@/util/apiHelpers";

const mockedSafeRequest = safeRequest as jest.Mock;

describe("WorkoutDetailApi", () => {
  let api: IWorkoutDetailApi;

  beforeEach(() => {
    api = new WorkoutDetailApi();
    mockedSafeRequest.mockClear();
  });

  describe("fetchWorkoutDetailsFromServer", () => {
    it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
      const userId = "user-123";
      const serverRes = mockFetchWorkoutDetailsResponse;
      mockedSafeRequest.mockResolvedValue(serverRes);

      const result = await api.fetchWorkoutDetailsFromServer(userId);

      expect(result).toEqual(serverRes.workoutDetails);
    });

    it("인자를 URL과 함께 safeRequest를 호출한다", async () => {
      const userId = "user-123";
      mockedSafeRequest.mockResolvedValue(mockFetchWorkoutDetailsResponse);

      await api.fetchWorkoutDetailsFromServer(userId);

      expect(mockedSafeRequest).toHaveBeenCalledWith(
        expect.stringContaining(`/api/workout/detail?userId=${userId}`),
        {},
        expect.anything()
      );
    });

    it("실패시 safeRequest가 던진 에러를 그대로 전달한다", async () => {
      const userId = "user-123";
      const mockError = new ApiError(500, "서버 터짐");
      mockedSafeRequest.mockRejectedValue(mockError);

      await expect(api.fetchWorkoutDetailsFromServer(userId)).rejects.toThrow(
        mockError
      );
    });
  });

  describe("postWorkoutDetailsToServer", () => {
    const mappedUnsynced = [
      { ...mockWorkoutDetail.past, workoutId: "workout-123" },
    ];

    it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
      const serverRes = mockPostWorkoutDetailsToServerResponse;
      mockedSafeRequest.mockResolvedValue(serverRes);

      const result = await api.postWorkoutDetailsToServer(mappedUnsynced);

      expect(result).toEqual(serverRes);
    });

    it("올바른 URL과 인자로 safeRequest를 호출한다", async () => {
      mockedSafeRequest.mockResolvedValue(
        mockPostWorkoutDetailsToServerResponse
      );

      await api.postWorkoutDetailsToServer(mappedUnsynced);

      expect(mockedSafeRequest).toHaveBeenCalledWith(
        `${BASE_URL}/api/workout/detail/sync`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ mappedUnsynced }),
        }),
        expect.anything()
      );
    });

    it("실패시 safeRequest가 던진 에러를 그대로 전달한다", async () => {
      const mockError = new ApiError(422, "데이터 이상함");
      mockedSafeRequest.mockRejectedValue(mockError);

      await expect(
        api.postWorkoutDetailsToServer(mappedUnsynced)
      ).rejects.toThrow(mockError);
    });
  });
});
