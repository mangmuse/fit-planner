jest.mock("@/util/api-helpers", () => ({
  __esModule: true,
  ...jest.requireActual("@/util/api-helpers"),
  safeRequest: jest.fn(),
}));

import {
  createBaseRoutineDetailMock,
  mockFetchRoutineDetailsResponse,
  mockPostRoutineDetailsToServerResponse,
} from "@/__mocks__/routineDetail.mock";
import { RoutineDetailApi } from "@/api/routineDetail.api";

import { BASE_URL } from "@/constants";

import { IRoutineDetailApi } from "@/types/apis";
import { ApiError, safeRequest } from "@/util/api-helpers";
import { LocalRoutineDetailWithServerRoutineId } from "@/types/models";

const mockedSafeRequest = safeRequest as jest.Mock;
describe("RoutineDetailApi", () => {
  let api: IRoutineDetailApi;

  beforeEach(() => {
    api = new RoutineDetailApi();
    mockedSafeRequest.mockClear();
  });

  describe("fetchRoutineDetailsFromServer", () => {
    it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
      const userId = "user-123";
      mockedSafeRequest.mockResolvedValue(mockFetchRoutineDetailsResponse);
      const result = await api.fetchRoutineDetailsFromServer(userId);
      expect(result).toEqual(mockFetchRoutineDetailsResponse.routineDetails);
    });

    it("인자를 URL과 함께 safeRequest를 호출한다", async () => {
      const userId = "user-123";
      mockedSafeRequest.mockResolvedValue({ routineDetails: [] });

      await api.fetchRoutineDetailsFromServer(userId);

      expect(mockedSafeRequest).toHaveBeenCalledWith(
        `${BASE_URL}/api/routine/detail/${userId}`,
        expect.anything(),
        expect.anything()
      );
    });

    it("실패시 safeRequest가 던진 에러를 그대로 전달한다", async () => {
      const mockError = new ApiError(500, "서버 터짐");
      mockedSafeRequest.mockRejectedValue(mockError);

      await expect(
        api.fetchRoutineDetailsFromServer("user-123")
      ).rejects.toThrow(mockError);
    });
  });

  describe("postRoutineDetailsToServer", () => {
    it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
      const mappedUnsynced: LocalRoutineDetailWithServerRoutineId[] = [
        {
          ...createBaseRoutineDetailMock({ isSynced: false }),
          routineId: "server-routine-123",
          exerciseId: 100,
        },
      ];
      mockedSafeRequest.mockResolvedValue(
        mockPostRoutineDetailsToServerResponse
      );
      const result = await api.postRoutineDetailsToServer(mappedUnsynced);
      expect(result).toBe(mockPostRoutineDetailsToServerResponse);
    });

    it("인자를 URL과 함께 safeRequest를 호출한다", async () => {
      const mappedUnsynced: LocalRoutineDetailWithServerRoutineId[] = [
        {
          ...createBaseRoutineDetailMock({ isSynced: false }),
          routineId: "server-routine-123",
          exerciseId: 100,
        },
      ];

      mockedSafeRequest.mockResolvedValue(
        mockPostRoutineDetailsToServerResponse
      );

      await api.postRoutineDetailsToServer(mappedUnsynced);

      expect(mockedSafeRequest).toHaveBeenCalledWith(
        `${BASE_URL}/api/routine/detail/sync`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ mappedUnsynced }),
        }),
        expect.anything()
      );
    });

    it("실패시 safeRequest가 던진 에러를 그대로 전달한다", async () => {
      const mappedUnsynced: LocalRoutineDetailWithServerRoutineId[] = [
        {
          ...createBaseRoutineDetailMock({ isSynced: false }),
          routineId: "server-routine-123",
          exerciseId: 100,
        },
      ];
      const mockError = new ApiError(422, "데이터 이상함");

      mockedSafeRequest.mockRejectedValue(mockError);

      await expect(
        api.postRoutineDetailsToServer(mappedUnsynced)
      ).rejects.toThrow(mockError);
    });
  });
});
