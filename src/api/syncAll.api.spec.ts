import {
  SyncAllApi,
  SyncAllToServerResponse,
  syncAllToServerResponseSchema,
} from "@/api/syncAll.api";
import { ApiError, safeRequest } from "@/util/apiHelpers";

jest.mock("@/util/apiHelpers", () => ({
  __esModule: true,
  ...jest.requireActual("@/util/apiHelpers"),
  safeRequest: jest.fn(),
}));

describe("SyncAllApi", () => {
  const mockedSafeRequest = safeRequest as jest.Mock;
  let api;
  beforeEach(() => {
    api = new SyncAllApi();
    mockedSafeRequest.mockClear();
  });
  describe("syncAllToServer", () => {
    it("전달받은 인자와 함께 safeRequest를 호출한다", async () => {
      const userId = "user-123";
      const props = {
        userId,
        nestedExercises: [],
        nestedWorkouts: [],
        nestedRoutines: [],
      };

      await api.syncAllToServer(props);

      expect(mockedSafeRequest).toHaveBeenCalledWith(
        expect.stringContaining(`/api/sync/all`),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(props),
        }),
        syncAllToServerResponseSchema
      );
    });
    it("서버 응답이 실패할 경우 에러를 전파한다", async () => {
      const userId = "user-123";
      const mockError = new ApiError(500, "서버 터짐");
      mockedSafeRequest.mockRejectedValue(mockError);

      await expect(
        api.syncAllToServer({
          userId,
          nestedExercises: [],
          nestedWorkouts: [],
          nestedRoutines: [],
        })
      ).rejects.toThrow(mockError);
    });
  });
});
