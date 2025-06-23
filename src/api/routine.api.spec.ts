jest.mock("@/util/api-helpers", () => ({
  __esModule: true,
  ...jest.requireActual("@/util/api-helpers"),
  safeRequest: jest.fn(),
}));

import {
  createBaseRoutineMock,
  mockFetchRoutinesResponse,
  mockPostRoutinesToServerResponse,
} from "@/__mocks__/routine.mock";
import { RoutineApi } from "@/api/routine.api";

import { BASE_URL } from "@/constants";

import { IRoutineApi } from "@/types/apis";
import { ApiError, safeRequest } from "@/util/api-helpers";

const mockedSafeRequest = safeRequest as jest.Mock;
describe("RoutineApi", () => {
  let api: IRoutineApi;

  beforeEach(() => {
    api = new RoutineApi();
    mockedSafeRequest.mockClear();
  });

  describe("fetchRoutinesFromServer", () => {
    it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
      const userId = "user-123";
      mockedSafeRequest.mockResolvedValue(mockFetchRoutinesResponse);
      const result = await api.fetchRoutinesFromServer(userId);
      expect(result).toEqual(mockFetchRoutinesResponse.routines);
    });

    it("인자를 URL과 함께 safeRequest를 호출한다", async () => {
      const userId = "user-123";
      const serverRes = mockFetchRoutinesResponse;
      mockedSafeRequest.mockResolvedValue(serverRes);

      await api.fetchRoutinesFromServer(userId);

      expect(mockedSafeRequest).toHaveBeenCalledWith(
        `${BASE_URL}/api/routine/${userId}`,
        expect.anything(),
        expect.anything()
      );
    });

    it("실패시 safeRequest가 던진 에러를 그대로 전달한다", async () => {
      const mockError = new ApiError(500, "서버 터짐");
      mockedSafeRequest.mockRejectedValue(mockError);

      await expect(api.fetchRoutinesFromServer("user-123")).rejects.toThrow(
        mockError
      );
    });
  });

  describe("postRoutinesToServer", () => {
    it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
      const unsynced = [createBaseRoutineMock({ isSynced: false })];
      mockedSafeRequest.mockResolvedValue(mockPostRoutinesToServerResponse);
      const result = await api.postRoutinesToServer(unsynced);
      expect(result).toBe(mockPostRoutinesToServerResponse);
    });

    it("올바른 URL과 인자로 safeRequest를 호출한다", async () => {
      const unsynced = [createBaseRoutineMock({ isSynced: false })];

      mockedSafeRequest.mockResolvedValue(mockPostRoutinesToServerResponse);

      await api.postRoutinesToServer(unsynced);

      expect(mockedSafeRequest).toHaveBeenCalledWith(
        `${BASE_URL}/api/routine/sync`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ unsynced }),
        }),
        expect.anything()
      );
    });

    it("실패시 safeRequest가 던진 에러를 그대로 전달한다", async () => {
      const unsynced = [createBaseRoutineMock({ isSynced: false })];
      const mockError = new ApiError(500, "서버 터짐");

      mockedSafeRequest.mockRejectedValue(mockError);

      await expect(api.postRoutinesToServer(unsynced)).rejects.toThrow(
        mockError
      );
    });
  });
});
