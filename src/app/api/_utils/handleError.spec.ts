import { handleServerError, HttpError } from "./handleError";

describe("handleServerError", () => {
  it("HttpError는 해당 status와 message로 응답한다", async () => {
    const httpError = new HttpError("커스텀 에러 메시지", 422);

    const response = handleServerError(httpError);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toEqual({
      success: false,
      message: "커스텀 에러 메시지",
    });
  });

  it("일반 에러는 500 status와 기본 메시지로 응답한다", async () => {
    const generalError = new Error("일반 에러");

    const response = handleServerError(generalError);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      message: "예상치 못한 서버 에러",
    });
  });

  it("문자열 에러도 500 status로 처리한다", async () => {
    const stringError = "문자열 에러";

    const response = handleServerError(stringError);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      message: "예상치 못한 서버 에러",
    });
  });

  it("undefined도 500 status로 처리한다", async () => {
    const response = handleServerError(undefined);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      message: "예상치 못한 서버 에러",
    });
  });
});
