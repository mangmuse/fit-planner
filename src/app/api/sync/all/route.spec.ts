jest.mock("@/util/validateData");
jest.mock("@/app/api/_utils/handleError", () => ({
  ...jest.requireActual("@/app/api/_utils/handleError"),
  handleServerError: jest.fn(),
}));

import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { handleServerError, HttpError } from "@/app/api/_utils/handleError";
import { POST } from "@/app/api/sync/all/route";
import { prisma } from "@/lib/prisma";
import { ApiSuccessResponse } from "@/types/apiResponse";
import {
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
  NestedExercise,
  NestedRoutine,
  NestedWorkout,
  Saved,
  UserExercise,
} from "@/types/models";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";

const mockTx = {
  exercise: {
    create: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  userExercise: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  fixedExerciseMemo: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  dailyExerciseMemo: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  workout: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  workoutDetail: {
    deleteMany: jest.fn(),
  },
  routine: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  routineDetail: {
    deleteMany: jest.fn(),
  },
};

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return callback(mockTx);
    }),
  },
}));

const mockUserId = "user-123";
const mockNestedExercise: NestedExercise = {
  id: 100,
  category: "하체",
  imageUrl: "",
  isCustom: false,
  name: "데드리프트",
  serverId: 1,
  isSynced: false,
  userId: mockUserId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userExercise: {
    isBookmarked: false,
    dailyMemos: [
      {
        content: "힘들었음",
        createdAt: new Date().toISOString(),
        date: "2025-06-05",
        updatedAt: null,
      },
    ],
    fixedMemo: {
      content: "이운동 안맞음",
      createdAt: new Date().toISOString(),
      updatedAt: null,
    },
    unit: "kg",
  },
};

const mockWD: Saved<LocalWorkoutDetail> = {
  ...mockWorkoutDetail.past,
  workoutId: 101,
  id: 123,
  exerciseId: 100,
};
const mockRD: Saved<LocalRoutineDetail> = {
  ...mockRoutineDetail.past,
  routineId: 101,
  id: 123,
  exerciseId: 100,
};

const mockNestedWorkout: NestedWorkout = {
  id: 101,
  date: "2025-06-05",
  status: "COMPLETED",
  isSynced: false,
  serverId: null,
  userId: mockUserId,
  details: [mockWD],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockNestedRoutine: NestedRoutine = {
  id: 101,
  name: "데드리프트",
  description: "데드리프트 운동",
  isSynced: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  serverId: null,
  userId: mockUserId,
  details: [mockRD],
};

describe("POST api/sync/all", () => {
  const targetUrl = "http://localhost/api/sync/all";
  const mockedValidateData = validateData as jest.Mock;
  const mockedHandleServerError = handleServerError as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createRequest = (body: any) => {
    return new NextRequest(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  };

  const expectDeleteMethodsCalled = () => {
    expect(mockTx.dailyExerciseMemo.deleteMany).toHaveBeenCalled();
    expect(mockTx.fixedExerciseMemo.deleteMany).toHaveBeenCalled();
    expect(mockTx.workoutDetail.deleteMany).toHaveBeenCalled();
    expect(mockTx.routineDetail.deleteMany).toHaveBeenCalled();
    expect(mockTx.userExercise.deleteMany).toHaveBeenCalled();
    expect(mockTx.exercise.deleteMany).toHaveBeenCalled();
    expect(mockTx.workout.deleteMany).toHaveBeenCalled();
    expect(mockTx.routine.deleteMany).toHaveBeenCalled();
  };

  const expectWorkoutCreatedWith = (
    workout: NestedWorkout,
    userId: string,
    expectedExerciseId: number
  ) => {
    expect(mockTx.workout.create).toHaveBeenCalledWith({
      data: {
        date: new Date(workout.date),
        userId,
        status: workout.status,
        createdAt: new Date(workout.createdAt),
        updatedAt: workout.updatedAt ? new Date(workout.updatedAt) : undefined,
        workoutDetails: {
          create: workout.details.map((detail) => ({
            exerciseId: expectedExerciseId,
            isDone: detail.isDone,
            setOrder: detail.setOrder,
            setType: detail.setType,
            weight: detail.weight,
            reps: detail.reps,
            rpe: detail.rpe,
            exerciseOrder: detail.exerciseOrder,
            createdAt: new Date(detail.createdAt),
            updatedAt: detail.updatedAt
              ? new Date(detail.updatedAt)
              : undefined,
          })),
        },
      },
    });
  };

  const expectRoutineCreatedWith = (
    routine: NestedRoutine,
    userId: string,
    expectedExerciseId: number
  ) => {
    expect(mockTx.routine.create).toHaveBeenCalledWith({
      data: {
        name: routine.name,
        description: routine.description,
        userId,
        createdAt: new Date(routine.createdAt),
        updatedAt: routine.updatedAt ? new Date(routine.updatedAt) : undefined,
        routineDetails: {
          create: routine.details.map((detail) => ({
            exerciseId: expectedExerciseId,
            weight: detail.weight,
            reps: detail.reps,
            rpe: detail.rpe,
            exerciseOrder: detail.exerciseOrder,
            setOrder: detail.setOrder,
            setType: detail.setType,
            createdAt: new Date(detail.createdAt),
            updatedAt: detail.updatedAt
              ? new Date(detail.updatedAt)
              : undefined,
          })),
        },
      },
    });
  };

  const expectExerciseCreatedWith = (
    exercise: NestedExercise,
    userId: string
  ) => {
    const { userExercise, ...exerciseData } = exercise;

    expect(mockTx.exercise.create).toHaveBeenCalledWith({
      data: {
        name: exerciseData.name,
        category: exerciseData.category,
        imageUrl: exerciseData.imageUrl,
        isCustom: true,
        userId,
        userExercises: userExercise
          ? {
              create: [
                {
                  userId,
                  isBookmarked: userExercise.isBookmarked,
                  unit: userExercise.unit,
                  fixedExerciseMemo: userExercise.fixedMemo
                    ? {
                        create: {
                          content: userExercise.fixedMemo.content,
                          createdAt: new Date(userExercise.fixedMemo.createdAt),
                          updatedAt: userExercise.fixedMemo.updatedAt
                            ? new Date(userExercise.fixedMemo.updatedAt)
                            : undefined,
                        },
                      }
                    : undefined,
                  dailyExerciseMemos: {
                    create: userExercise.dailyMemos.map((memo) => ({
                      date: new Date(memo.date),
                      content: memo.content,
                      createdAt: new Date(memo.createdAt),
                      updatedAt: memo.updatedAt
                        ? new Date(memo.updatedAt)
                        : undefined,
                    })),
                  },
                },
              ],
            }
          : undefined,
      },
    });
  };

  const expectUserExerciseCreatedWith = (
    exerciseId: number,
    userExercise: UserExercise,
    userId: string
  ) => {
    expect(mockTx.userExercise.create).toHaveBeenCalledWith({
      data: {
        exerciseId,
        userId,
        isBookmarked: userExercise.isBookmarked,
        unit: userExercise.unit,
        fixedExerciseMemo: userExercise.fixedMemo
          ? {
              create: {
                content: userExercise.fixedMemo.content,
                createdAt: new Date(userExercise.fixedMemo.createdAt),
                updatedAt: userExercise.fixedMemo.updatedAt
                  ? new Date(userExercise.fixedMemo.updatedAt)
                  : undefined,
              },
            }
          : undefined,
        dailyExerciseMemos: {
          create: userExercise.dailyMemos.map((memo) => ({
            date: new Date(memo.date),
            content: memo.content,
            createdAt: new Date(memo.createdAt),
            updatedAt: memo.updatedAt ? new Date(memo.updatedAt) : undefined,
          })),
        },
      },
    });
  };
  describe("성공", () => {
    it("기본 운동이며 userExercise가 있으면 userExercise만 생성하며, workout과 routine은 serverId로 매핑된 exerciseId를 사용한다", async () => {
      const mockBody = {
        userId: mockUserId,
        nestedExercises: [mockNestedExercise],
        nestedWorkouts: [mockNestedWorkout],
        nestedRoutines: [mockNestedRoutine],
      };

      const req = createRequest(mockBody);

      mockedValidateData.mockReturnValueOnce(mockBody);
      mockTx.exercise.findMany.mockResolvedValueOnce([
        { id: 1, name: "데드리프트" },
      ]);

      const res = await POST(req);
      expect(res.status).toBe(201);
      expectDeleteMethodsCalled();

      expect(mockTx.exercise.findMany).toHaveBeenCalled();

      expectWorkoutCreatedWith(mockNestedWorkout, mockUserId, 1);
      expectRoutineCreatedWith(mockNestedRoutine, mockUserId, 1);

      expect(mockTx.exercise.create).not.toHaveBeenCalled();
      expectUserExerciseCreatedWith(
        1,
        mockNestedExercise.userExercise!,
        mockUserId
      );
    });

    it("기본 운동의 경우 userExercise가 없으면 생성하지 않는다", async () => {
      const mockBody = {
        userId: mockUserId,
        nestedExercises: [
          { ...mockNestedExercise, isCustom: false, userExercise: null },
        ],
        nestedWorkouts: [],
        nestedRoutines: [],
      };

      const req = createRequest(mockBody);

      mockedValidateData.mockReturnValueOnce(mockBody);
      mockTx.exercise.findMany.mockResolvedValueOnce([
        { id: 1, name: "데드리프트" },
      ]);

      const res = await POST(req);
      expect(res.status).toBe(201);

      expectDeleteMethodsCalled();

      expect(mockTx.userExercise.create).not.toHaveBeenCalled();
      expect(mockTx.exercise.create).not.toHaveBeenCalled();
      expect(mockTx.workout.create).not.toHaveBeenCalled();
      expect(mockTx.routine.create).not.toHaveBeenCalled();
    });

    it("커스텀 운동일경우 항상 운동을 생성한다", async () => {
      const mockBody = {
        userId: mockUserId,
        nestedExercises: [{ ...mockNestedExercise, isCustom: true }],
        nestedWorkouts: [mockNestedWorkout],
        nestedRoutines: [mockNestedRoutine],
      };

      const req = createRequest(mockBody);

      mockedValidateData.mockReturnValueOnce(mockBody);
      mockTx.exercise.findMany.mockResolvedValueOnce([
        { id: 1, name: "데드리프트" },
      ]);
      mockTx.exercise.create.mockResolvedValueOnce({ id: 1 });

      const res = await POST(req);
      expect(res.status).toBe(201);

      expectDeleteMethodsCalled();
      expectExerciseCreatedWith(
        { ...mockNestedExercise, isCustom: true },
        mockUserId
      );
      expectWorkoutCreatedWith(mockNestedWorkout, mockUserId, 1);
      expectRoutineCreatedWith(mockNestedRoutine, mockUserId, 1);
    });

    it("대용량 데이터를 처리할 수 있다", async () => {
      const largeExercises = Array.from({ length: 100 }, (_, i) => ({
        ...mockNestedExercise,
        id: i + 1,
        name: `운동${i + 1}`,
        isCustom: false,
        userExercise: null,
      }));

      const largeWorkouts = Array.from({ length: 200 }, (_, i) => ({
        ...mockNestedWorkout,
        id: i + 1,
        date: `2025-06-${String((i % 30) + 1).padStart(2, "0")}`,
        details: [
          {
            ...mockWD,
            id: i + 1,
            exerciseId: (i % 100) + 1,
          },
        ],
      }));

      const largeRoutines = Array.from({ length: 50 }, (_, i) => ({
        ...mockNestedRoutine,
        id: i + 1,
        name: `루틴${i + 1}`,
        details: [
          {
            ...mockRD,
            id: i + 1,
            exerciseId: (i % 100) + 1,
          },
        ],
      }));

      const mockBody = {
        userId: mockUserId,
        nestedExercises: largeExercises,
        nestedWorkouts: largeWorkouts,
        nestedRoutines: largeRoutines,
      };

      const req = createRequest(mockBody);
      mockedValidateData.mockReturnValueOnce(mockBody);

      const serverExercises = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `운동${i + 1}`,
      }));
      mockTx.exercise.findMany.mockResolvedValueOnce(serverExercises);

      const startTime = Date.now();
      const res = await POST(req);
      const endTime = Date.now();

      expect(res.status).toBe(201);
      expect(endTime - startTime).toBeLessThan(35000);

      expectDeleteMethodsCalled();
      expect(mockTx.workout.create).toHaveBeenCalledTimes(200);
      expect(mockTx.routine.create).toHaveBeenCalledTimes(50);
    }, 35000);

    it("기본운동을 찾을 수 없는 경우 해당 운동을 건너뛴다", async () => {
      const mockBody = {
        userId: mockUserId,
        nestedExercises: [
          {
            ...mockNestedExercise,
            name: "데드리프트",
            isCustom: false,
            userExercise: null,
          },
        ],
        nestedWorkouts: [
          {
            ...mockNestedWorkout,
            details: [
              { ...mockWD, exerciseId: 100 },
              { ...mockWD, id: 124, exerciseId: 999 },
            ],
          },
        ],
        nestedRoutines: [
          {
            ...mockNestedRoutine,
            details: [
              { ...mockRD, exerciseId: 100 },
              { ...mockRD, id: 124, exerciseId: 999 },
            ],
          },
        ],
      };

      const req = createRequest(mockBody);
      mockedValidateData.mockReturnValueOnce(mockBody);

      mockTx.exercise.findMany.mockResolvedValueOnce([
        { id: 1, name: "데드리프트" },
      ]);

      const res = await POST(req);
      expect(res.status).toBe(201);

      expectDeleteMethodsCalled();

      // 필터링된 데이터로 헬퍼 함수 사용
      const expectedWorkout = {
        ...mockNestedWorkout,
        details: [{ ...mockWD, exerciseId: 100 }],
      };
      const expectedRoutine = {
        ...mockNestedRoutine,
        details: [{ ...mockRD, exerciseId: 100 }],
      };

      expectWorkoutCreatedWith(expectedWorkout, mockUserId, 1);
      expectRoutineCreatedWith(expectedRoutine, mockUserId, 1);
    });
  });

  describe("실패", () => {
    it("body 검증 실패시 422 에러를 반환한다", async () => {
      const mockBody = {
        userId: mockUserId,
        nestedExercises: [mockNestedExercise],
        nestedWorkouts: [mockNestedWorkout],
        nestedRoutines: [{ ...mockNestedRoutine, greeting: "hello" }],
      };

      const mockErrorRes = new HttpError("이상해요", 422);

      mockedValidateData.mockImplementationOnce(() => {
        throw mockErrorRes;
      });

      mockedHandleServerError.mockReturnValueOnce(
        NextResponse.json(
          { success: false, message: mockErrorRes.message },
          { status: mockErrorRes.status }
        )
      );

      const req = createRequest(mockBody);

      const res = await POST(req);

      expect(mockedHandleServerError).toHaveBeenCalledWith(mockErrorRes);

      expect(res.status).toBe(422);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toBe("이상해요");
    });

    it("데이터베이스 오류가 발생하면 500 에러를 반환하며 트랜잭션은 실행되지 않는다", async () => {
      const mockBody = {
        userId: mockUserId,
        nestedExercises: [mockNestedExercise],
        nestedWorkouts: [mockNestedWorkout],
        nestedRoutines: [mockNestedRoutine],
      };
      const mockErrorRes = new Error("DB 에러");

      mockedValidateData.mockReturnValueOnce(mockBody);

      let transactionExecuted = false;
      let transactionSucceeded = false;

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (fn) => {
        transactionExecuted = true;
        try {
          const result = await fn(mockTx);
          transactionSucceeded = true;
          return result;
        } catch (error) {
          transactionSucceeded = false;
          throw error;
        }
      });

      mockTx.exercise.findMany.mockResolvedValueOnce([
        { id: 1, name: "데드리프트" },
      ]);

      mockTx.workout.create.mockRejectedValueOnce(mockErrorRes);

      mockedHandleServerError.mockReturnValueOnce(
        NextResponse.json(
          { success: false, message: "예상치 못한 서버 에러" },
          { status: 500 }
        )
      );

      const req = createRequest(mockBody);

      const res = await POST(req);

      expect(transactionExecuted).toBe(true);
      expect(transactionSucceeded).toBe(false);

      expect(mockedHandleServerError).toHaveBeenCalledWith(mockErrorRes);
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toBe("예상치 못한 서버 에러");
    });
  });
});
