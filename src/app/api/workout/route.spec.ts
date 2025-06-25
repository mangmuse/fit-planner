jest.mock("@/app/api/_utils/getWorkouts");
jest.mock("@/app/api/_utils/handleError");
import { NextRequest } from "next/server";
import { GET } from "@/app/api/workout/route";
import { getWorkouts } from "@/app/api/_utils/getWorkouts";
import { handleServerError } from "@/app/api/_utils/handleError";
import { ClientWorkout } from "@/types/models";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/apiResponse";
import { mockWorkout } from "@/__mocks__/workout.mock";

describe("GET /api/workout", () => {
  const mockedGetWorkouts = getWorkouts as jest.Mock;
  const mockedHandleServerError = handleServerError as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const targetUrl = `http://localhost/api/workout`;
  const userId = "user-123";
  const mockClientWorkouts: ClientWorkout[] = [mockWorkout.server];
  it("userId에 맞는 workout들을 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${userId}`);

    mockedGetWorkouts.mockResolvedValue(mockClientWorkouts);

    const res = await GET(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      workouts: ClientWorkout[];
    }>;

    expect(res.status).toBe(200);
    expect(body.workouts).toEqual(mockClientWorkouts);
    expect(mockedGetWorkouts).toHaveBeenCalledWith(userId);
  });

  it("해당하는 workout이 없는경우 빈배열을 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${userId}`);

    mockedGetWorkouts.mockResolvedValue([]);

    const res = await GET(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      workouts: ClientWorkout[];
    }>;

    expect(res.status).toBe(200);
    expect(body.workouts).toEqual([]);
    expect(mockedGetWorkouts).toHaveBeenCalledWith(userId);
  });

  it("userId가 없는경우 400 에러를 반환한다", async () => {
    const req = new NextRequest(targetUrl);

    const res = await GET(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("userId가 필요합니다");
    expect(mockedGetWorkouts).not.toHaveBeenCalled();
  });

  it("getWorkouts 함수에서 에러 발생시 500 에러를 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${userId}`);
    const dbError = new Error("DB 연결 실패");

    const mockErrorResponseObject: ApiErrorResponse = {
      success: false,
      message: dbError.message,
    };
    const mockNextResponse = new Response(
      JSON.stringify(mockErrorResponseObject),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );

    mockedGetWorkouts.mockRejectedValue(dbError);
    mockedHandleServerError.mockReturnValue(mockNextResponse);

    const res = await GET(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(mockedGetWorkouts).toHaveBeenCalledWith(userId);
    expect(mockedHandleServerError).toHaveBeenCalledWith(dbError);
    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toBe(dbError.message);
  });
});
