jest.mock("@/app/api/_utils/handleError");
jest.mock("@/util/validateData");

import { mockWorkout } from "@/__mocks__/workout.mock";
import { handleServerError, HttpError } from "@/app/api/_utils/handleError";
import { POST } from "@/app/api/workout/sync/route";
import { prisma } from "@/lib/prisma";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/apiResponse";
import { ClientWorkout } from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";
import { string } from "zod";

describe("POST /api/workout/sync", () => {
  const mockedHandleServerError = handleServerError as jest.Mock;
  const mockedValidateData = validateData as jest.Mock;
  const mockedPrismaUpsert = prisma.workout.upsert as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const targetUrl = "http://localhost/api/workout/sync";
  const mockUserId = "user-123";

  it("unsynced가 빈 배열인경우 200 상태코드와 함께 빈 배열을 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      body: JSON.stringify({ unsynced: [] }),
    });

    mockedValidateData.mockReturnValue({ unsynced: [] });
    const mockWo: ClientWorkout = mockWorkout.server;
    mockedPrismaUpsert.mockResolvedValue(mockWo);

    const res = await POST(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      updated: { localId: number; serverId: string }[];
    }>;

    expect(res.status).toBe(200);
    expect(body.updated).toEqual([]);

    expect(mockedPrismaUpsert).not.toHaveBeenCalled();
  });

  it("unsynced가 존재하는경우 200 상태코드와 함께 업데이트된 목록을 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      body: JSON.stringify({ unsynced: [mockWorkout.unsynced] }),
    });
    const mockUpdated = [
      { localId: mockWorkout.unsynced.id, serverId: mockWorkout.server.id },
    ];

    mockedValidateData.mockReturnValue({ unsynced: [mockWorkout.unsynced] });
    mockedPrismaUpsert.mockResolvedValue(mockWorkout.server);

    const res = await POST(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      updated: { localId: number; serverId: string }[];
    }>;

    expect(res.status).toBe(200);
    expect(body.updated).toEqual(mockUpdated);

    expect(mockedPrismaUpsert).toHaveBeenCalledWith({
      where: {
        userId_date: {
          userId: mockWorkout.unsynced.userId,
          date: expect.any(Date),
        },
      },
      update: {
        status: mockWorkout.unsynced.status,
        updatedAt: mockWorkout.unsynced.updatedAt,
      },
      create: {
        userId: mockWorkout.unsynced.userId,
        createdAt: mockWorkout.unsynced.createdAt,
        status: mockWorkout.unsynced.status,
        date: expect.any(Date),
      },
    });
  });

  it("unsynced를 올바르게 전달하지 않은경우 422 에러를 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      body: JSON.stringify({}),
    });
    const mockError = new HttpError("Validation Error", 422);

    mockedValidateData.mockImplementation(() => {
      throw mockError;
    });
    mockedHandleServerError.mockReturnValue(
      NextResponse.json(
        { success: false, message: mockError.message },
        { status: 422 }
      )
    );

    const res = await POST(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(res.status).toBe(422);
    expect(body.message).toBe(mockError.message);

    expect(mockedHandleServerError).toHaveBeenCalledWith(mockError);
  });

  it("db 에러가 발생하면 500 에러를 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      body: JSON.stringify({ unsynced: [mockWorkout.unsynced] }),
    });
    const mockError = new Error("DB 에러");

    mockedValidateData.mockReturnValue({ unsynced: [mockWorkout.unsynced] });
    mockedPrismaUpsert.mockRejectedValue(mockError);
    mockedHandleServerError.mockReturnValue(
      NextResponse.json(
        { success: false, message: mockError.message },
        { status: 500 }
      )
    );

    const res = await POST(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(res.status).toBe(500);
    expect(body.message).toBe(mockError.message);

    expect(mockedHandleServerError).toHaveBeenCalledWith(mockError);
  });
});
