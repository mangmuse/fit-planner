import {
  mockFetchWorkoutsResponse,
  mockPostWorkoutsToServerResponse,
  mockWorkout,
} from "@/__mocks__/workout.mock";
import { WorkoutApi } from "@/api/workout.api";
import { BASE_URL } from "@/constants";
import { IWorkoutApi } from "@/types/apis";
import { ApiError, safeRequest } from "@/util/api-helpers";
import { isSymbol } from "lodash";
import { mock } from "node:test";
import { a } from "node_modules/framer-motion/dist/types.d-B_QPEvFK";

jest.mock("@/util/api-helpers", () => ({
  __esModule: true,
  ...jest.requireActual("@/util/api-helpers"),
  safeRequest: jest.fn(),
}));

const mockedSafeRequest = safeRequest as jest.Mock;

describe("WorkoutApi", () => {
  let api: IWorkoutApi;
  beforeEach(() => {
    api = new WorkoutApi();
    mockedSafeRequest.mockClear();
  });
  describe("fetchWorkoutsFromServer", () => {
    it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
      const userId = "user-123";
      const serverRes = mockFetchWorkoutsResponse;

      mockedSafeRequest.mockResolvedValue(serverRes);

      const result = await api.fetchWorkoutsFromServer(userId);

      expect(result).toEqual(serverRes.workouts);
    });

    it("인자를 URL과 함께 safeRequest를 호출한다", async () => {
      const userId = "user-123";
      const serverRes = mockFetchWorkoutsResponse;

      mockedSafeRequest.mockResolvedValue(serverRes);

      await api.fetchWorkoutsFromServer(userId);

      expect(mockedSafeRequest).toHaveBeenCalledWith(
        expect.stringContaining(`/api/workout/${userId}`),
        expect.anything(),
        expect.anything()
      );
    });

    it("실패시 safeRequest가 던진 에러를 그대로 전달한다", () => {
      const userId = "user-123";
      const mockError = new ApiError(500, "서버 터짐");
      mockedSafeRequest.mockRejectedValue(mockError);

      expect(api.fetchWorkoutsFromServer(userId)).rejects.toThrow(mockError);
    });
  });

  describe("postWorkoutsToServer", () => {
    it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
      const serverRes = mockPostWorkoutsToServerResponse;
      const unsynced = [mockWorkout.unsynced];
      mockedSafeRequest.mockResolvedValue(serverRes);
      const result = await api.postWorkoutsToServer(unsynced);
      expect(result).toEqual(serverRes);
    });
    it("올바른 URL과 인자로 safeRequest를 호출한다", async () => {
      const unsynced = [mockWorkout.unsynced];
      const serverRes = mockPostWorkoutsToServerResponse;
      mockedSafeRequest.mockResolvedValue(serverRes);

      await api.postWorkoutsToServer(unsynced);

      expect(mockedSafeRequest).toHaveBeenCalledWith(
        expect.stringContaining(`${BASE_URL}/api/workout/sync`),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ unsynced }),
        }),
        expect.anything()
      );
    });
    it("실패시 safeRequest가 던진 에러를 그대로 전달한다", () => {
      const unsynced = [mockWorkout.unsynced];
      const mockError = new ApiError(500, "서버 터짐");
      mockedSafeRequest.mockRejectedValue(mockError);

      expect(api.postWorkoutsToServer(unsynced)).rejects.toThrow(mockError);
    });
  });
});
