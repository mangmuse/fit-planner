const mockTx = {
  exercise: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  userExercise: {
    upsert: jest.fn(),
  },
  fixedExerciseMemo: {
    upsert: jest.fn(),
  },
  dailyExerciseMemo: {
    upsert: jest.fn(),
  },
};

jest.mock("@/util/validateData");
// jest.mock("@/app/api/_utils/handleError");
jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return callback(mockTx);
    }),
  },
}));
import { mockExercise } from "@/__mocks__/exercise.mock";
import { handleServerError, HttpError } from "@/app/api/_utils/handleError";
import { POST, UpdatedListItem } from "@/app/api/exercises/sync/route";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/apiResponse";
import { LocalExercise } from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest } from "next/server";

import {
  DailyExerciseMemo,
  FixedExerciseMemo,
  UserExercise,
} from "@prisma/client";

describe("POST /api/exercises/sync", () => {
  const mockedValidateData = validateData as jest.Mock;
  const mockedHandleServerError = handleServerError as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUserId = "user-123";
  const mockUnsyncedExercises: LocalExercise[] = [
    {
      ...mockExercise.bookmarked,
      isSynced: false,
      serverId: 555,
      exerciseMemo: {
        daily: [
          {
            date: new Date().toISOString(),
            content: "mockContent",
            createdAt: new Date().toISOString(),
            updatedAt: null,
          },
          {
            date: new Date().toISOString(),
            content: "mockContent2",
            createdAt: new Date().toISOString(),
            updatedAt: null,
          },
        ],
        fixed: {
          content: "mockContent",
          createdAt: new Date().toISOString(),
          updatedAt: null,
        },
      },
    },
  ];

  const targetUrl = `http://localhost/api/exercises/sync`;

  it("서버에 존재하는 운동을 업데이트하고 updatedList를 반환한다", async () => {
    if (!mockUnsyncedExercises[0].id || !mockUnsyncedExercises[0].serverId) {
      throw new Error("테스트에 필요한 id또는 serverId가 없습니다");
    }
    const updatedList: UpdatedListItem[] = [
      {
        localId: mockUnsyncedExercises[0].id,
        serverId: mockUnsyncedExercises[0].serverId!,
      },
    ];
    const mockUserExercise: UserExercise = {
      id: "mockUE",
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: mockUserId,
      exerciseId: mockUnsyncedExercises[0].serverId!,
      isBookmarked: false,
      unit: "kg",
    };

    const mockFixedExerciseMemo: FixedExerciseMemo = {
      id: "mockFixedExerciseMemo",
      createdAt: new Date(),
      updatedAt: new Date(),
      userExerciseId: "mockUE",
      content: "mockContent",
    };

    const mockDailyExerciseMemo: DailyExerciseMemo = {
      id: "mockDailyExerciseMemo",
      createdAt: new Date(),
      updatedAt: new Date(),
      userExerciseId: "mockUE",
      date: new Date(),
      content: "mockContent",
    };

    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unsynced: mockUnsyncedExercises,
        userId: mockUserId,
      }),
    });

    const mockServerExercise = {
      ...mockExercise.server,
      id: mockUnsyncedExercises[0].serverId,
    };

    mockedValidateData.mockReturnValue({
      unsynced: mockUnsyncedExercises,
      userId: mockUserId,
    });
    mockTx.exercise.findUnique.mockResolvedValue(mockServerExercise);
    mockTx.userExercise.upsert.mockResolvedValue(mockUserExercise);
    mockTx.fixedExerciseMemo.upsert.mockResolvedValue(mockFixedExerciseMemo);
    mockTx.dailyExerciseMemo.upsert.mockResolvedValue(mockDailyExerciseMemo);

    const res = await POST(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      updated: UpdatedListItem[];
    }>;

    expect(mockTx.exercise.create).not.toHaveBeenCalled();
    expect(mockTx.exercise.findUnique).toHaveBeenCalledTimes(1);
    expect(mockTx.dailyExerciseMemo.upsert).toHaveBeenCalledTimes(2);
    expect(mockTx.userExercise.upsert).toHaveBeenCalledWith({
      where: {
        userId_exerciseId: {
          userId: mockUserId,
          exerciseId: mockUnsyncedExercises[0].serverId,
        },
      },
      update: {
        isBookmarked: mockUnsyncedExercises[0].isBookmarked,
        unit: mockUnsyncedExercises[0].unit,
      },
      create: {
        userId: mockUserId,
        exerciseId: mockUnsyncedExercises[0].serverId,
        isBookmarked: mockUnsyncedExercises[0].isBookmarked,
        unit: mockUnsyncedExercises[0].unit,
      },
    });

    expect(mockTx.exercise.findUnique).toHaveBeenCalledWith({
      where: {
        id: mockUnsyncedExercises[0].serverId,
      },
    });

    expect(mockTx.fixedExerciseMemo.upsert).toHaveBeenCalledWith({
      where: {
        userExerciseId: "mockUE",
      },
      update: {
        content: "mockContent",
        updatedAt: expect.any(Date),
      },
      create: {
        userExerciseId: "mockUE",
        content: "mockContent",
        createdAt: expect.any(Date),
        updatedAt: null,
      },
    });
    expect(mockTx.dailyExerciseMemo.upsert).toHaveBeenCalledWith({
      where: {
        userExerciseId_date: {
          userExerciseId: "mockUE",
          date: expect.any(Date),
        },
      },
      update: {
        content: "mockContent",
        updatedAt: expect.any(Date),
      },
      create: {
        userExerciseId: "mockUE",
        date: expect.any(Date),
        content: "mockContent",
        createdAt: expect.any(Date),
        updatedAt: null,
      },
    });

    expect(body.updated).toEqual(updatedList);
  });

  it("userId와 unsynced 가 올바르게 전달되지 않으면 422 에러를 반환한다", async () => {
    const mockErrorRes = new HttpError("이상해요", 422);
    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unsynced: mockUnsyncedExercises }),
    });

    mockedValidateData.mockImplementation(() => {
      throw mockErrorRes;
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it("데이터베이스 오류가 발생하면 500 에러를 반환하며 이외의 db 커밋은 롤백된다", async () => {
    const mockErrorContent = { message: "DB 에러" };
    const mockErrorStatus = 500;
    const mockErrorRes = new HttpError(
      mockErrorContent.message,
      mockErrorStatus
    );

    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unsynced: mockUnsyncedExercises,
        userId: mockUserId,
      }),
    });

    mockedValidateData.mockReturnValue({
      unsynced: mockUnsyncedExercises,
      userId: mockUserId,
    });
    mockTx.exercise.findUnique.mockRejectedValue(mockErrorRes);

    const res = await POST(req);

    expect(mockTx.exercise.findUnique).toHaveBeenCalledTimes(1);
    expect(mockTx.exercise.create).not.toHaveBeenCalled();
    expect(mockTx.userExercise.upsert).not.toHaveBeenCalled();
    expect(mockTx.fixedExerciseMemo.upsert).not.toHaveBeenCalled();
    expect(mockTx.dailyExerciseMemo.upsert).not.toHaveBeenCalled();

    expect(res.status).toBe(mockErrorStatus);
  });

  it("unsynced가 빈 배열이면 200 상태코드와 빈 배열을 반환한다", async () => {
    const req = new NextRequest(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unsynced: [], userId: mockUserId }),
    });

    mockedValidateData.mockReturnValue({
      unsynced: [],
      userId: mockUserId,
    });

    const res = await POST(req);
    const body = (await res.json()) as ApiSuccessResponse<{
      updated: UpdatedListItem[];
    }>;

    expect(res.status).toBe(200);
    expect(body.updated).toEqual([]);
  });
});
