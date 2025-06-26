jest.mock("@/app/api/_utils/getWorkouts");
jest.mock("@/app/api/_utils/handleError");
jest.mock("@/util/validateData");

import { createPrismaWorkoutDetailResponse } from "@/__mocks__/app/api/workout/detail/mockData";
import { getWorkoutIds } from "@/app/api/_utils/getWorkouts";
import { handleServerError, HttpError } from "@/app/api/_utils/handleError";
import { GET, WorkoutDetailWithExercise } from "@/app/api/workout/detail/route";
import { prisma } from "@/lib/prisma";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/apiResponse";
import { ClientWorkoutDetail } from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";

describe("GET /api/workout/detail", () => {
  const mockedGetWorkoutIds = getWorkoutIds as jest.Mock;
  const mockedValidateData = validateData as jest.Mock;
  const mockedHandleServerError = handleServerError as jest.Mock;
  const mockedPrismaFindMany = prisma.workoutDetail.findMany as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const targetUrl = "http://localhost/api/workout/detail";
  const mockUserId = "user-123";
  const mockFindManyResponse: WorkoutDetailWithExercise[] = [
    createPrismaWorkoutDetailResponse({ workoutId: "workout-1" }),
    createPrismaWorkoutDetailResponse({ workoutId: "workout-2" }),
    createPrismaWorkoutDetailResponse({ workoutId: "workout-3" }),
  ];

  it("workoutDetail이 없는경우 200 상태코드와 함께 빈 배열을 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${mockUserId}`);

    mockedValidateData.mockReturnValue(mockUserId);
    mockedGetWorkoutIds.mockResolvedValue([]);
    mockedPrismaFindMany.mockResolvedValue([]);

    const res = await GET(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      workoutDetails: ClientWorkoutDetail[];
    }>;

    expect(res.status).toBe(200);
    expect(body.workoutDetails).toEqual([]);
  });

  it("userId가 없거나 올바르지 않은 타입이면 400 상태코드와 함께 에러 메시지를 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}`);

    const res = await GET(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(res.status).toBe(400);
    expect(body.message).toBe("userId가 없거나 타입이 올바르지 않습니다");

    expect(mockedGetWorkoutIds).not.toHaveBeenCalled();
    expect(prisma.workoutDetail.findMany).not.toHaveBeenCalled();
    expect(mockedHandleServerError).not.toHaveBeenCalled();
  });

  it("DB 조회 중 오류가 발생하면 500 상태코드와 함께 에러 메시지를 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${mockUserId}`);
    const mockError = new Error("DB 조회 중 오류");

    mockedValidateData.mockReturnValue(mockUserId);
    mockedGetWorkoutIds.mockResolvedValue([
      "workout-1",
      "workout-2",
      "workout-3",
    ]);

    mockedPrismaFindMany.mockRejectedValue(mockError);
    mockedHandleServerError.mockResolvedValue(
      NextResponse.json(
        {
          success: false,
          message: mockError.message,
        },
        {
          status: 500,
        }
      )
    );

    const res = await GET(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(res.status).toBe(500);
    expect(body.message).toBe("DB 조회 중 오류");

    expect(mockedGetWorkoutIds).toHaveBeenCalledWith(mockUserId);
    expect(mockedHandleServerError).toHaveBeenCalled();
  });

  it("userId가 올바른 타입이면 200 상태코드와 함께 운동 상세 목록을 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${mockUserId}`);

    mockedValidateData.mockReturnValue(mockUserId);
    mockedGetWorkoutIds.mockResolvedValue([
      "workout-1",
      "workout-2",
      "workout-3",
    ]);

    mockedPrismaFindMany.mockResolvedValue(mockFindManyResponse);

    const res = await GET(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      workoutDetails: ClientWorkoutDetail[];
    }>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.workoutDetails).toMatchSnapshot();
    expect(mockedGetWorkoutIds).toHaveBeenCalledWith(mockUserId);
    expect(mockedHandleServerError).not.toHaveBeenCalled();
  });
});
