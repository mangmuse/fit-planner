import { safeRequest } from "@/util/apiHelpers";
import { server } from "jest.setup";
import { http, HttpResponse } from "msw";
import { z } from "zod";

const MOCK_URL = "https://api.test.com/data";

describe("safeRequest (schema required)", () => {
  describe("성공 시나리오", () => {
    it("요청이 성공하면, Zod 스키마로 검증된 데이터를 반환한다", async () => {
      const mockData = { id: 1, name: "철수" };
      const schema = z.object({ id: z.number(), name: z.string() });
      server.use(http.get(MOCK_URL, () => HttpResponse.json(mockData)));

      const result = await safeRequest(MOCK_URL, {}, schema);

      expect(result).toEqual(mockData);
    });
  });

  describe("실패 시나리오", () => {
    it("Zod 유효성 검사에 실패하면 ZodError를 던진다", async () => {
      const invalidData = { id: "nubmer타입이아님", name: "철수" };
      const schema = z.object({ id: z.number(), name: z.string() });
      server.use(http.get(MOCK_URL, () => HttpResponse.json(invalidData)));

      await expect(safeRequest(MOCK_URL, {}, schema)).rejects.toThrow(
        z.ZodError
      );
    });

    it("서버가 404 에러와 JSON 에러 메시지를 반환하면, 해당 메시지를 담은 ApiError를 던진다", async () => {
      const errorResponse = { message: "데이터를 찾을 수 없습니다." };
      server.use(
        http.get(MOCK_URL, () =>
          HttpResponse.json(errorResponse, { status: 404 })
        )
      );

      await expect(safeRequest(MOCK_URL, {}, z.any())).rejects.toMatchObject({
        status: 404,
        message: "데이터를 찾을 수 없습니다.",
      });
    });

    it("서버가 500 에러와 JSON이 아닌 응답을 반환하면, 기본 에러 메시지를 담은 ApiError를 던진다", async () => {
      server.use(
        http.get(MOCK_URL, () => new HttpResponse(null, { status: 500 }))
      );

      await expect(safeRequest(MOCK_URL, {}, z.any())).rejects.toMatchObject({
        status: 500,
        message: "요청 실패 (500)",
      });
    });

    it("fetch 자체가 네트워크 에러로 실패하면, 해당 에러를 그대로 던진다", async () => {
      server.use(http.get(MOCK_URL, () => HttpResponse.error()));

      await expect(safeRequest(MOCK_URL, {}, z.any())).rejects.toThrow();
    });
  });
});
