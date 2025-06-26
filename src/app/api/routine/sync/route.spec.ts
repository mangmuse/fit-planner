jest.mock("@/app/api/_utils/handleError", () => ({
  ...jest.requireActual("@/app/api/_utils/handleError"),
  handleServerError: jest.fn(),
}));
jest.mock("@/util/validateData");

import { mockRoutine } from "@/__mocks__/routine.mock";
import { handleServerError, HttpError } from "@/app/api/_utils/handleError";
import { UpdatedListItem } from "@/app/api/exercises/sync/route";
import { POST } from "@/app/api/routine/sync/route";
import { prisma } from "@/lib/prisma";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/apiResponse";
import { LocalRoutine } from "@/types/models";
import { validateData } from "@/util/validateData";
import { Routine } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

describe("POST /api/routine/sync", () => {
  const mockedHandleServerError = handleServerError as jest.Mock;
  const mockedValidateData = validateData as jest.Mock;
  const mockedPrismaCreate = prisma.routine.create as jest.Mock;
  const mockedPrismaUpdate = prisma.routine.update as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const targetUrl = "http://localhost/api/routine/sync";
  const mockUnsyncedObj = {
    ...mockRoutine.unsynced,
    serverId: "mock-server-id-1",
  };
  const mockUnsynced: LocalRoutine[] = [mockUnsyncedObj];
  const mockUpdatedWorkout: Routine = {
    ...mockRoutine.server,
    createdAt: new Date(2025, 1, 1),
    updatedAt: new Date(2025, 1, 1),
  };

  it("unsynced가 서버에 존재하는경우 200 상태코드와 함께 업데이트된 목록을 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ unsynced: mockUnsynced }),
    });
    mockedValidateData.mockReturnValue({ unsynced: mockUnsynced });
    mockedPrismaUpdate.mockResolvedValue(mockUpdatedWorkout);

    const res = await POST(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      updated: UpdatedListItem[];
    }>;

    expect(res.status).toBe(200);
    expect(body.updated).toEqual([
      { localId: mockUnsyncedObj.id, serverId: mockUpdatedWorkout.id },
    ]);
    expect(mockedPrismaCreate).not.toHaveBeenCalled();
    expect(mockedPrismaUpdate).toHaveBeenCalledWith({
      where: { id: mockUnsyncedObj.serverId },
      data: {
        name: mockUnsyncedObj.name,
        description: mockUnsyncedObj.description,
        updatedAt: mockUnsyncedObj.updatedAt,
      },
    });
  });

  it("unsynced가 서버에 존재하지 않는경우 200 상태코드와 함께 업데이트된 목록을 반환한다", async () => {
    const mockUnsyncedObj = {
      ...mockRoutine.unsynced,
      serverId: null,
    };
    const mockUnsynced: LocalRoutine[] = [mockUnsyncedObj];
    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ unsynced: mockUnsynced }),
    });
    mockedValidateData.mockReturnValue({ unsynced: mockUnsynced });
    mockedPrismaCreate.mockResolvedValue(mockUpdatedWorkout);

    const res = await POST(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      updated: UpdatedListItem[];
    }>;

    expect(res.status).toBe(200);
    expect(body.updated).toEqual([
      { localId: mockUnsyncedObj.id, serverId: mockUpdatedWorkout.id },
    ]);
    expect(mockedPrismaCreate).toHaveBeenCalledWith({
      data: {
        userId: mockUnsyncedObj.userId,
        name: mockUnsyncedObj.name,
        description: mockUnsyncedObj.description,
        createdAt: mockUnsyncedObj.createdAt,
      },
    });
    expect(mockedPrismaUpdate).not.toHaveBeenCalled();
  });

  it("unsynced가 빈 배열인경우 200 상태코드와 함께 빈 배열을 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ unsynced: [] }),
    });

    mockedValidateData.mockReturnValue({ unsynced: [] });

    const res = await POST(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      updated: UpdatedListItem[];
    }>;

    expect(res.status).toBe(200);
    expect(body.updated).toEqual([]);
    expect(mockedPrismaCreate).not.toHaveBeenCalled();
    expect(mockedPrismaUpdate).not.toHaveBeenCalled();
  });

  it("데이터가 유효하지 않은경우 422 상태코드와 함께 에러를 반환한다", async () => {
    const mockError = new HttpError("Invalid data", 422);

    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ unsynced: "invalid" }),
    });
    mockedValidateData.mockImplementation(() => {
      throw mockError;
    });
    mockedHandleServerError.mockReturnValue(
      NextResponse.json(
        {
          success: false,
          message: mockError.message,
        },
        { status: mockError.status }
      )
    );

    const res = await POST(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(mockedHandleServerError).toHaveBeenCalledWith(mockError);
    expect(res.status).toBe(422);
    expect(body.message).toBe(mockError.message);
  });

  it("db에서 에러가 발생하는 경우 500 상태코드와 함께 에러를 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        unsynced: { ...mockUnsynced, serverId: "mock-server-id-1" },
      }),
    });
    const mockError = new Error("DB 에러");
    mockedValidateData.mockReturnValue({ unsynced: mockUnsynced });
    mockedPrismaUpdate.mockImplementation(() => {
      throw mockError;
    });
    mockedHandleServerError.mockReturnValue(
      NextResponse.json(
        {
          success: false,
          message: "예상치 못한 서버 에러",
        },
        { status: 500 }
      )
    );

    const res = await POST(req);
    const body = (await res.json()) as ApiErrorResponse;

    expect(mockedPrismaCreate).not.toHaveBeenCalled();
    expect(mockedPrismaUpdate).toHaveBeenCalledTimes(1);
    expect(mockedHandleServerError).toHaveBeenCalledWith(mockError);
    expect(res.status).toBe(500);
    expect(body.message).toBe("예상치 못한 서버 에러");
  });
});
