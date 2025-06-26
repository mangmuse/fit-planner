jest.mock("@/util/validateData");
jest.mock("@/app/api/_utils/getRoutines");
jest.mock("@/app/api/_utils/handleError");

import { mockRoutine } from "@/__mocks__/routine.mock";
import { getRoutines } from "@/app/api/_utils/getRoutines";
import { handleServerError } from "@/app/api/_utils/handleError";
import { GET } from "@/app/api/routine/route";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/apiResponse";
import { ClientRoutine } from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";

describe("GET /api/routine", () => {
  const mockedGetRoutines = getRoutines as jest.Mock;
  const mockedValidateData = validateData as jest.Mock;
  const mockedHandleServerError = handleServerError as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const targetUrl = "http://localhost/api/routine";
  const mockUserId = "user-123";
  const mockR: ClientRoutine = { ...mockRoutine.server, userId: mockUserId };

  it("userId가 없거나 올바르지 않은 타입이면 400 상태코드와 함께 에러 메시지를 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}`);

    const res = await GET(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(res.status).toBe(400);
    expect(body.message).toBe("userId가 없거나 타입이 올바르지 않습니다");

    expect(mockedValidateData).not.toHaveBeenCalled();
    expect(mockedHandleServerError).not.toHaveBeenCalled();
    expect(mockedGetRoutines).not.toHaveBeenCalled();
  });

  it("userId가 올바른 타입이면 200 상태코드와 함께 루틴 목록을 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${mockUserId}`);

    mockedValidateData.mockReturnValue(mockUserId);
    mockedGetRoutines.mockResolvedValue([mockR]);

    const res = await GET(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      routines: ClientRoutine[];
    }>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.routines).toEqual([mockR]);
    expect(mockedHandleServerError).not.toHaveBeenCalled();
  });

  it("일치하는 루틴이 없으면 200 상태코드와 빈 배열을 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${mockUserId}`);

    mockedValidateData.mockReturnValue(mockUserId);
    mockedGetRoutines.mockResolvedValue([]);

    const res = await GET(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      routines: ClientRoutine[];
    }>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.routines).toEqual([]);
  });

  it("루틴 조회 중 에러가 발생하면 500 상태코드와 함께 에러 메시지를 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${mockUserId}`);
    const mockError = new Error("DB에러 발생");

    mockedValidateData.mockReturnValue(mockUserId);
    mockedGetRoutines.mockRejectedValue(mockError);
    mockedHandleServerError.mockResolvedValue(
      NextResponse.json(
        {
          success: false,
          message: mockError.message,
        },
        { status: 500 }
      )
    );

    const res = await GET(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(res.status).toBe(500);
    expect(body.message).toBe(mockError.message);

    expect(mockedGetRoutines).toHaveBeenCalledWith(mockUserId);
    expect(mockedHandleServerError).toHaveBeenCalledWith(mockError);
  });
});
