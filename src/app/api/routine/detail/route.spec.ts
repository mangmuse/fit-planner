jest.mock("@/app/api/_utils/getRoutines");
jest.mock("@/app/api/_utils/handleError");
jest.mock("@/util/validateData");
import { createPrismaRoutineDetailResponse } from "@/__mocks__/app/api/routine/detail/mockData";
import { getRoutineIds } from "@/app/api/_utils/getRoutines";
import { handleServerError } from "@/app/api/_utils/handleError";
import { GET, RoutineDetailWithIncludes } from "@/app/api/routine/detail/route";
import { prisma } from "@/lib/prisma";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/apiResponse";
import { ClientRoutineDetail } from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";

describe("GET /api/routine/detail", () => {
  const mockedGetRoutineIds = getRoutineIds as jest.Mock;
  const mockedValidateData = validateData as jest.Mock;
  const mockedHandleServerError = handleServerError as jest.Mock;
  const mockedPrismaFindMany = prisma.routineDetail.findMany as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const targetUrl = "http://localhost/api/routine/detail";
  const mockUserId = "user-123";
  const getMockFindManyResponse = (): RoutineDetailWithIncludes[] => [
    createPrismaRoutineDetailResponse({ routineId: "routine-1" }),
    createPrismaRoutineDetailResponse({ routineId: "routine-2" }),
    createPrismaRoutineDetailResponse({ routineId: "routine-3" }),
  ];

  it("routineDetail이 없는경우 200 상태코드와 함께 빈 배열을 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${mockUserId}`);

    mockedValidateData.mockReturnValue(mockUserId);
    mockedGetRoutineIds.mockResolvedValue([]);
    mockedPrismaFindMany.mockResolvedValue([]);

    const res = await GET(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      routineDetails: ClientRoutineDetail[];
    }>;

    expect(res.status).toBe(200);
    expect(body.routineDetails).toEqual([]);
  });

  it("userId가 없거나 올바르지 않은 타입이면 400 상태코드와 함께 에러 메시지를 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}`);

    const res = await GET(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(res.status).toBe(400);
    expect(body.message).toBe("userId가 없거나 타입이 올바르지 않습니다");

    expect(mockedGetRoutineIds).not.toHaveBeenCalled();
    expect(mockedHandleServerError).not.toHaveBeenCalled();
  });

  it("DB 조회 중 오류가 발생하면 500 상태코드와 함께 에러 메시지를 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${mockUserId}`);
    const mockError = new Error("DB 조회 중 오류");

    mockedValidateData.mockReturnValue(mockUserId);
    mockedGetRoutineIds.mockResolvedValue([
      "routine-1",
      "routine-2",
      "routine-3",
    ]);

    mockedPrismaFindMany.mockRejectedValue(mockError);
    mockedHandleServerError.mockResolvedValue(
      NextResponse.json(
        { success: false, message: mockError.message },
        { status: 500 }
      )
    );

    const res = await GET(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(res.status).toBe(500);
    expect(body.message).toBe(mockError.message);
  });

  it("routineDetail 목록을 200 상태코드와 함께 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${mockUserId}`);

    mockedValidateData.mockReturnValue(mockUserId);
    mockedGetRoutineIds.mockResolvedValue([
      "routine-1",
      "routine-2",
      "routine-3",
    ]);
    mockedPrismaFindMany.mockResolvedValue(getMockFindManyResponse());

    const res = await GET(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      routineDetails: ClientRoutineDetail[];
    }>;

    expect(res.status).toBe(200);
    expect(body.routineDetails).toMatchSnapshot();

    expect(mockedGetRoutineIds).toHaveBeenCalledWith(mockUserId);
  });
});
