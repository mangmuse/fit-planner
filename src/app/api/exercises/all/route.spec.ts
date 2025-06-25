jest.mock("@/util/validateData");
jest.mock("@/app/api/_utils/handleError");

import { createPrismaExerciseResponse } from "@/__mocks__/app/api/exercises/all/mockData";
import { handleServerError } from "@/app/api/_utils/handleError";
import { ExerciseWithIncludes, GET } from "@/app/api/exercises/all/route";
import { prisma } from "@/lib/prisma";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/apiResponse";
import { ClientExercise } from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

describe("GET /api/exercises/all", () => {
  const mockedExercisesFindMany = prisma.exercise.findMany as jest.Mock;
  const mockedValidateData = validateData as jest.Mock;
  const mockedHandleServerError = handleServerError as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  const mockUserId = "user-123";
  const mockPrismaResponse: ExerciseWithIncludes[] = [
    createPrismaExerciseResponse({}),
    createPrismaExerciseResponse({
      id: 2,
      name: "테스트운동",
      userExercises: [{ isBookmarked: true }],
    }),
  ];

  const targetUrl = `http://localhost/api/exercises/all`;
  it("운동 목록을 200 상태코드와 함께 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${mockUserId}`);

    mockedValidateData.mockReturnValue(mockUserId);
    mockedExercisesFindMany.mockResolvedValue(mockPrismaResponse);

    const res = await GET(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      exercises: ClientExercise[];
    }>;

    expect(res.status).toBe(200);
    expect(body.exercises).toHaveLength(2);
    expect(body.exercises[1].isBookmarked).toBe(true);
    expect(typeof body.exercises[0].createdAt).toBe("string");
  });

  it("DB에서 해당하는 운동 데이터가 없으면, 빈 배열을 포함한 성공 응답을 반환한다", async () => {
    const req = new NextRequest(`${targetUrl}?userId=${mockUserId}`);

    mockedValidateData.mockReturnValue(mockUserId);
    mockedExercisesFindMany.mockResolvedValue([]);

    const res = await GET(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      exercises: ClientExercise[];
    }>;

    expect(res.status).toBe(200);
    expect(body.exercises).toEqual([]);
  });

  it("userId 쿼리 파라미터가 제공되지 않으면 400 에러를 반환한다", async () => {
    const req = new NextRequest(targetUrl);

    const res = await GET(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("userId 파라미터가 없습니다");
  });

  it("DB 조회 도중 에러 발생시 500 에러를 반환해야 한다", async () => {
    const dbError = new Error("DB 연결 실패");
    const mockErrorRes = new Response(
      JSON.stringify({
        success: false,
        message: dbError.message,
      } as ApiErrorResponse),
      { status: 500 }
    );

    mockedValidateData.mockReturnValue(mockUserId);
    mockedExercisesFindMany.mockRejectedValue(dbError);
    mockedHandleServerError.mockReturnValue(mockErrorRes);

    const req = new NextRequest(`${targetUrl}?userId=${mockUserId}`);
    const res = await GET(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toBe(dbError.message);
  });

  it("반환하려는 데이터가 유효하지 않으면 500 에러를 반환한다", async () => {
    const prismaRes: ExerciseWithIncludes[] = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createPrismaExerciseResponse({ name: 100 as any }),
    ];

    const zodError = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["name"],
        message: "Expected string, received number",
      },
    ]);

    const mockErrorRes = new Response(
      JSON.stringify({
        success: false,
        message: zodError.message,
      } as ApiErrorResponse),
      { status: 500 }
    );

    mockedValidateData.mockReturnValue(mockUserId);
    mockedExercisesFindMany.mockResolvedValue(prismaRes);
    mockedHandleServerError.mockReturnValue(mockErrorRes);

    const req = new NextRequest(`${targetUrl}?userId=${mockUserId}`);
    const res = await GET(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(mockedHandleServerError).toHaveBeenCalledWith(zodError);
    expect(body.message).toBe(zodError.message);
  });
});
