import { validateData, VALIDATION_FAILED } from "./validateData";
import { HttpError } from "@/app/api/_utils/handleError";
import { z } from "zod";

describe("validateData", () => {
  it("유효한 데이터를 검증하고 반환한다", () => {
    const schema = z.string();
    const validData = "test string";

    const result = validateData(schema, validData);

    expect(result).toBe(validData);
  });

  it("validation 실패 시 HttpError를 throw한다", () => {
    const mockSchema = {
      safeParse: jest.fn().mockReturnValue({
        success: false,
        error: {
          issues: [{ message: "테스트 에러 메시지" }],
          message: "전체 에러 메시지",
        },
      }),
    };
    const invalidData = "invalid";

    expect(() =>
      validateData(mockSchema as unknown as z.ZodSchema, invalidData)
    ).toThrow(HttpError);
    expect(() =>
      validateData(mockSchema as unknown as z.ZodSchema, invalidData)
    ).toThrow("Validation failed: 테스트 에러 메시지");
  });

  it("HttpError가 422 상태코드를 가진다", () => {
    const mockSchema = {
      safeParse: jest.fn().mockReturnValue({
        success: false,
        error: {
          issues: [{ message: "에러" }],
          message: "전체 에러",
        },
      }),
    };

    try {
      validateData(mockSchema as unknown as z.ZodSchema, "invalid");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).status).toBe(422);
    }
  });

  it("여러 에러 메시지를 콤마로 조합한다", () => {
    const mockSchema = {
      safeParse: jest.fn().mockReturnValue({
        success: false,
        error: {
          issues: [
            { message: "첫번째 에러" },
            { message: "두번째 에러" },
            { message: "세번째 에러" },
          ],
          message: "전체 에러",
        },
      }),
    };

    expect(() =>
      validateData(mockSchema as unknown as z.ZodSchema, "invalid")
    ).toThrow("Validation failed: 첫번째 에러, 두번째 에러, 세번째 에러");
  });
});
