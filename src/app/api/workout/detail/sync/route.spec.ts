jest.mock("@/app/api/_utils/handleError", () => ({
  ...jest.requireActual("@/app/api/_utils/handleError"),
  handleServerError: jest.fn(),
}));
jest.mock("@/util/validateData");

import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { handleServerError, HttpError } from "@/app/api/_utils/handleError";
import { POST } from "@/app/api/workout/detail/sync/route";
import { prisma } from "@/lib/prisma";

import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";
import { WorkoutDetail, Workout } from "@prisma/client";
import { createPrismaWorkoutDetailResponse } from "@/__mocks__/app/api/workout/detail/mockData";

describe("POST /api/workout/detail/sync", () => {
  const mockedHandleServerError = handleServerError as jest.Mock;
  const mockedValidateData = validateData as jest.Mock;
  const mockedPrismaWorkoutDetailCreate = prisma.workoutDetail
    .create as jest.Mock;
  const mockedPrismaWorkoutDetailUpdate = prisma.workoutDetail
    .update as jest.Mock;
  const mockedPrismaWorkoutFindUnique = prisma.workout.findUnique as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const targetUrl = "http://localhost/api/workout/detail/sync";
  const mockUnsyncedWithServerId = {
    ...mockWorkoutDetail.unsynced,
    serverId: "mock-server-detail-id",
    workoutId: "mock-workout-id",
  };
  const mockUnsyncedWithoutServerId = {
    ...mockWorkoutDetail.unsynced,
    serverId: null,
    workoutId: "mock-workout-id",
  };
  const mockWorkoutResponse: Workout = {
    id: "mock-workout-id",
    userId: "user-123",
    date: new Date(),
    status: "COMPLETED",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockWorkoutDetailResponse: WorkoutDetail =
    createPrismaWorkoutDetailResponse();

  it("serverId가 있는 경우 업데이트하고 updatedList를 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mappedUnsynced: [mockUnsyncedWithServerId] }),
    });

    mockedValidateData.mockReturnValue({
      mappedUnsynced: [mockUnsyncedWithServerId],
    });
    mockedPrismaWorkoutDetailUpdate.mockResolvedValue(
      mockWorkoutDetailResponse
    );
    mockedPrismaWorkoutFindUnique.mockResolvedValue(mockWorkoutResponse);

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockedPrismaWorkoutDetailCreate).not.toHaveBeenCalled();
    expect(mockedPrismaWorkoutDetailUpdate).toHaveBeenCalledWith({
      where: { id: mockUnsyncedWithServerId.serverId },
      data: expect.objectContaining({
        weight: mockUnsyncedWithServerId.weight,
        setOrder: mockUnsyncedWithServerId.setOrder,
        isDone: mockUnsyncedWithServerId.isDone,
      }),
    });
    expect(body.updated).toEqual([
      {
        localId: mockUnsyncedWithServerId.id,
        serverId: mockWorkoutDetailResponse.id,
        exerciseId: mockUnsyncedWithServerId.exerciseId,
        workoutId: mockUnsyncedWithServerId.workoutId,
      },
    ]);
  });

  it("serverId가 없는 경우 새로 생성하고 updatedList를 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mappedUnsynced: [mockUnsyncedWithoutServerId] }),
    });

    mockedValidateData.mockReturnValue({
      mappedUnsynced: [mockUnsyncedWithoutServerId],
    });
    mockedPrismaWorkoutFindUnique.mockResolvedValue(mockWorkoutResponse);
    mockedPrismaWorkoutDetailCreate.mockResolvedValue(
      mockWorkoutDetailResponse
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockedPrismaWorkoutDetailCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workout: { connect: { id: mockUnsyncedWithoutServerId.workoutId } },
        exercise: { connect: { id: mockUnsyncedWithoutServerId.exerciseId } },
        weight: mockUnsyncedWithoutServerId.weight,
        setOrder: mockUnsyncedWithoutServerId.setOrder,
      }),
    });
    expect(body.updated).toEqual([
      {
        localId: mockUnsyncedWithoutServerId.id,
        serverId: mockWorkoutDetailResponse.id,
        exerciseId: mockUnsyncedWithoutServerId.exerciseId,
        workoutId: mockUnsyncedWithoutServerId.workoutId,
      },
    ]);
  });

  it("workout이 존재하지 않으면 404 에러를 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mappedUnsynced: [mockUnsyncedWithoutServerId] }),
    });

    mockedValidateData.mockReturnValue({
      mappedUnsynced: [mockUnsyncedWithoutServerId],
    });
    mockedPrismaWorkoutFindUnique.mockResolvedValue(null);
    mockedHandleServerError.mockReturnValue(
      NextResponse.json(
        {
          success: false,
          message: "WorkoutId가 일치하는 workout을 찾지 못했습니다",
        },
        { status: 404 }
      )
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.message).toBe("WorkoutId가 일치하는 workout을 찾지 못했습니다");
    expect(mockedPrismaWorkoutDetailCreate).not.toHaveBeenCalled();
    expect(mockedHandleServerError).toHaveBeenCalled();
  });

  it("mappedUnsynced가 빈 배열인 경우 빈 updatedList를 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mappedUnsynced: [] }),
    });

    mockedValidateData.mockReturnValue({ mappedUnsynced: [] });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.updated).toEqual([]);
  });

  it("validation이 실패하면 422 에러를 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mappedUnsynced: "invalid" }),
    });

    const mockError = new HttpError("잘못된 요청입니다", 422);
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
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.message).toBe("잘못된 요청입니다");
    expect(mockedHandleServerError).toHaveBeenCalledWith(mockError);
    expect(mockedPrismaWorkoutDetailCreate).not.toHaveBeenCalled();
    expect(mockedPrismaWorkoutDetailUpdate).not.toHaveBeenCalled();
  });

  it("데이터베이스 에러가 발생하면 500 에러를 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mappedUnsynced: [mockUnsyncedWithServerId] }),
    });

    mockedValidateData.mockReturnValue({
      mappedUnsynced: [mockUnsyncedWithServerId],
    });
    mockedPrismaWorkoutDetailUpdate.mockRejectedValue(
      new Error("데이터베이스 에러")
    );
    mockedHandleServerError.mockReturnValue(
      NextResponse.json(
        { success: false, message: "데이터베이스 에러" },
        { status: 500 }
      )
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toBe("데이터베이스 에러");
    expect(mockedHandleServerError).toHaveBeenCalled();
  });

  it("생성과 업데이트가 혼합된 요청을 처리한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mappedUnsynced: [mockUnsyncedWithServerId, mockUnsyncedWithoutServerId],
      }),
    });

    mockedValidateData.mockReturnValue({
      mappedUnsynced: [mockUnsyncedWithServerId, mockUnsyncedWithoutServerId],
    });
    mockedPrismaWorkoutFindUnique.mockResolvedValue(mockWorkoutResponse);
    mockedPrismaWorkoutDetailUpdate.mockResolvedValue(
      createPrismaWorkoutDetailResponse({ id: "updated-detail-id" })
    );
    mockedPrismaWorkoutDetailCreate.mockResolvedValue(
      createPrismaWorkoutDetailResponse({ id: "created-detail-id" })
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockedPrismaWorkoutDetailCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workout: { connect: { id: mockUnsyncedWithoutServerId.workoutId } },
        exercise: { connect: { id: mockUnsyncedWithoutServerId.exerciseId } },
      }),
    });
    expect(mockedPrismaWorkoutDetailUpdate).toHaveBeenCalledWith({
      where: { id: mockUnsyncedWithServerId.serverId },
      data: expect.objectContaining({
        weight: mockUnsyncedWithServerId.weight,
      }),
    });
  });
});
