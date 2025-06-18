import { exerciseService } from "@/services/exercise.service";
// jest.mock("@/services/exercise.service.ts");
// jest.mock("@/services/workout.service.ts");
import { createMockExercise, mockExercise } from "@/__mocks__/exercise.mock";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { mockWorkout } from "@/__mocks__/workout.mock";
import {
  createBaseWorkoutDetailMock,
  mockWorkoutDetail,
} from "@/__mocks__/workoutDetail.mock";
import { workoutDetailAdapter } from "@/adapter/workoutDetail.adapter";
import { workoutService } from "@/services/workout.service";

import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
} from "@/types/models";

describe("getInitialWorkoutDetail", () => {
  it("초기 workout detail 객체를 반환한다", () => {
    const result = workoutDetailAdapter.getInitialWorkoutDetail();

    expect(result).toEqual({
      serverId: null,
      weight: 0,
      rpe: null,
      reps: 0,
      isDone: false,
      isSynced: false,
      setOrder: 1,
      exerciseOrder: 1,
      setType: "NORMAL",
      exerciseName: "",
      exerciseId: 0,
      workoutId: 0,
      createdAt: expect.any(String),
    });
  });
});

describe("createWorkoutDetail", () => {
  const override: Partial<LocalWorkoutDetail> = {
    exerciseName: "테스트 운동",
    exerciseId: 2,
    exerciseOrder: 2,
    setOrder: 2,
    workoutId: 2,
  };
  it("초기 workoutDetail 객체에 필요한 부분만 override 하여 반환한다", () => {
    const initialDetailMock = createBaseWorkoutDetailMock();
    jest
      .spyOn(workoutDetailAdapter, "getInitialWorkoutDetail")
      .mockReturnValue(initialDetailMock);
    const result = workoutDetailAdapter.createWorkoutDetail(override);
    const expected = { ...initialDetailMock, ...override };

    expect(result).toEqual(expected);
  });

  const missingPropertyCases = [
    { propertyName: "exerciseName" }, //
    { propertyName: "exerciseId" },
    { propertyName: "exerciseOrder" },
    { propertyName: "setOrder" },
    { propertyName: "workoutId" },
  ];

  it.each(missingPropertyCases)(
    "$PropertyName 속성이 없으면 에러를 던져야 한다",
    ({ propertyName }) => {
      const invalidOverride = { ...override };
      delete invalidOverride[propertyName as keyof typeof invalidOverride];
      expect(() => {
        workoutDetailAdapter.createWorkoutDetail(invalidOverride);
      }).toThrow(
        "exerciseName, exerciseId, exerciseOrder, setOrder, workoutId 는 필수 입력사항입니다."
      );
    }
  );
});

describe("mapPastWorkoutToWorkoutDetail", () => {
  let pastDetail: LocalWorkoutDetail;
  let targetWorkoutId: number;
  let newExerciseOrder: number;
  let initialDetail: LocalWorkoutDetail;
  beforeEach(() => {
    pastDetail = { ...mockWorkoutDetail.past };
    targetWorkoutId = 999;
    newExerciseOrder = 10;
    initialDetail = mockWorkoutDetail.createInput();

    jest
      .spyOn(workoutDetailAdapter, "getInitialWorkoutDetail")
      .mockReturnValue(initialDetail);
  });
  it("초기 workoutDetail 객체에 pastWorkoutDetail을 덮어씌워 반환한다", () => {
    const result = workoutDetailAdapter.mapPastWorkoutToWorkoutDetail(
      pastDetail,
      targetWorkoutId,
      newExerciseOrder
    );

    // 과거 디테일이 잘 복사 됐는지
    expect(result.exerciseId).toBe(pastDetail.exerciseId);
    expect(result.exerciseName).toBe(pastDetail.exerciseName);
    expect(result.weight).toBe(pastDetail.weight);
    expect(result.reps).toBe(pastDetail.reps);
    expect(result.rpe).toBe(pastDetail.rpe);
    expect(result.setType).toBe(pastDetail.setType);
    expect(result.setOrder).toBe(pastDetail.setOrder);

    // 초기화 되어야하는 속성이 제대로 초기화 됐는지
    expect(result.isDone).toBe(false);
    expect(result.isSynced).toBe(false);
    expect(result.serverId).toBeNull();
    expect(result.id).toBeUndefined();
    expect(result.createdAt).toBe(initialDetail.createdAt);
  });

  it("weight 또는 reps가 0인경우 결과에도 0이 올바르게 복사된다", () => {
    const mappedPast = { ...pastDetail, weight: 0, reps: 0 };
    const result = workoutDetailAdapter.mapPastWorkoutToWorkoutDetail(
      mappedPast,
      targetWorkoutId,
      newExerciseOrder
    );
    expect(result.reps).toBe(0);
    expect(result.weight).toBe(0);
  });
});

describe("getAddSetToWorkoutByLastSet", () => {
  it("초기 workoutDetail 객체에 인자로 받은 디테일의 일부를 올바르게 덮어씌워 반환한다", () => {
    const lastSet = { ...mockWorkoutDetail.past };
    const createDetailSpy = jest.spyOn(
      workoutDetailAdapter,
      "createWorkoutDetail"
    );
    workoutDetailAdapter.getAddSetToWorkoutByLastSet(lastSet);

    expect(createDetailSpy).toHaveBeenCalledTimes(1);

    expect(createDetailSpy).toHaveBeenCalledWith({
      // 복사되어야 하는 속성
      exerciseId: lastSet.exerciseId,
      exerciseName: lastSet.exerciseName,
      exerciseOrder: lastSet.exerciseOrder,
      setType: lastSet.setType,
      weight: lastSet.weight,
      reps: lastSet.reps,
      workoutId: lastSet.workoutId,

      // 초기화 되어야하는 속성
      rpe: 0,
      serverId: null,
      isSynced: false,
      isDone: false,
      setOrder: lastSet.setOrder + 1,
      createdAt: expect.any(String),
    });
  });

  it("lastSet의 createdAt이 아닌, 함수 호출 시점의 새로운 createdAt 값으로 덮어쓴다", () => {
    const lastSet = {
      ...mockWorkoutDetail.past,
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    const MOCK_NOW = new Date("2025-06-18T10:30:00.000Z");

    const dateSpy = jest
      .spyOn(global, "Date")
      .mockImplementation(() => MOCK_NOW);

    const createDetailSpy = jest.spyOn(
      workoutDetailAdapter,
      "createWorkoutDetail"
    );

    workoutDetailAdapter.getAddSetToWorkoutByLastSet(lastSet);

    expect(createDetailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: MOCK_NOW.toISOString(),
      })
    );

    dateSpy.mockRestore();
  });
});
describe("getNewWorkoutDetails", () => {
  it("선택된 운동 목록만큼 createWokroutDetail을 올바른 인자와 함께 호출해야 한다", () => {
    const selectedExercises = [
      { id: 1, name: "벤치프레스" },
      { id: 2, name: "스쿼트" },
    ];
    const newWorkoutInput = { workoutId: 100, startOrder: 10 };

    const createDetailSpy = jest
      .spyOn(workoutDetailAdapter, "createWorkoutDetail")
      .mockImplementation((input: Partial<LocalWorkoutDetail>) =>
        createBaseWorkoutDetailMock(input)
      );

    const result = workoutDetailAdapter.getNewWorkoutDetails(
      selectedExercises,
      newWorkoutInput
    );

    expect(result).toHaveLength(2);
    expect(result[0].isDone).toBe(false);
    expect(result[0].exerciseName).toBe("벤치프레스");
    expect(result[0].exerciseOrder).toBe(10);
    expect(result[1].exerciseName).toBe("스쿼트");
    expect(result[1].exerciseOrder).toBe(11);
    expect(createDetailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        workoutId: 100,
        exerciseName: "벤치프레스",
        exerciseOrder: 10,
      })
    );
    expect(createDetailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        workoutId: 100,
        exerciseName: "스쿼트",
        exerciseOrder: 11,
      })
    );
  });
  it("선택된 운동이 없으면 빈 배열을 반환하고 createWorkoutDetail을 호출하지 않는다", () => {
    const createDetailSpy = jest.spyOn(
      workoutDetailAdapter,
      "createWorkoutDetail"
    );

    const result = workoutDetailAdapter.getNewWorkoutDetails([], {
      workoutId: 1,
      startOrder: 1,
    });

    expect(result).toEqual([]);
    expect(createDetailSpy).not.toHaveBeenCalled();
  });
});

describe("convertLocalWorkoutDetailToServer", () => {
  it("의존 함수들이 반환한 serverId로 데이터를 올바르게 변환한다", async () => {
    const exerciseMock = mockExercise.synced;
    const workoutMock = mockWorkout.synced;

    jest
      .spyOn(exerciseService, "getExerciseWithLocalId")
      .mockResolvedValueOnce(exerciseMock);
    jest
      .spyOn(workoutService, "getWorkoutWithLocalId")
      .mockResolvedValueOnce(workoutMock);

    const localDetails = [
      mockWorkoutDetail.new({
        exerciseId: exerciseMock.id,
        workoutId: workoutMock.id,
      }),
    ];

    const result =
      await workoutDetailAdapter.convertLocalWorkoutDetailToServer(
        localDetails
      );

    expect(result[0].exerciseId).toBe(exerciseMock.serverId);
    expect(result[0].workoutId).toBe(workoutMock.serverId);
  });

  it("의존 함수가 반환한 값에 serverId가 없는경우 에러를 던진다", async () => {
    const exerciseMock = { ...mockExercise.synced, serverId: null };
    const workoutMock = { ...mockWorkout.synced, serverId: null };
    const localDetails = [
      mockWorkoutDetail.new({
        exerciseId: exerciseMock.id,
        workoutId: workoutMock.id,
      }),
    ];
    jest
      .spyOn(exerciseService, "getExerciseWithLocalId")
      .mockResolvedValueOnce(exerciseMock);
    jest
      .spyOn(workoutService, "getWorkoutWithLocalId")
      .mockResolvedValueOnce(workoutMock);

    const promise =
      workoutDetailAdapter.convertLocalWorkoutDetailToServer(localDetails);

    await expect(promise).rejects.toThrow(
      "exerciseId 또는 workoutId가 없습니다"
    );
  });
});

describe("convertServerWorkoutDetailToLocal", () => {
  it("의존 함수들이 반환한 localId로 데이터를 올바르게 변환한다", async () => {
    const exerciseMock = mockExercise.synced;
    const workoutMock = mockWorkout.synced;

    jest
      .spyOn(exerciseService, "getExerciseWithServerId")
      .mockResolvedValueOnce(exerciseMock);
    jest
      .spyOn(workoutService, "getWorkoutWithServerId")
      .mockResolvedValueOnce(workoutMock);

    const localDetails = [
      mockWorkoutDetail.fromServer({
        exerciseId: exerciseMock.serverId!,
        workoutId: workoutMock.serverId!,
      }),
    ];

    const result =
      await workoutDetailAdapter.convertServerWorkoutDetailToLocal(
        localDetails
      );

    expect(result[0].exerciseId).toBe(exerciseMock.id);
    expect(result[0].workoutId).toBe(workoutMock.id);
  });
  it("의존 함수가 반환한 값에 localId가 없는경우 에러를 던진다", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exerciseMock = { ...mockExercise.synced, id: null } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workoutMock = { ...mockWorkout.synced, id: null } as any;

    jest
      .spyOn(exerciseService, "getExerciseWithServerId")
      .mockResolvedValueOnce(exerciseMock);
    jest
      .spyOn(workoutService, "getWorkoutWithServerId")
      .mockResolvedValueOnce(workoutMock);
    const localDetails = [
      mockWorkoutDetail.fromServer({
        exerciseId: exerciseMock.serverId!,
        workoutId: workoutMock.serverId!,
      }),
    ];

    const promise =
      workoutDetailAdapter.convertServerWorkoutDetailToLocal(localDetails);

    await expect(promise).rejects.toThrow(
      "exerciseId 또는 workoutId가 없습니다."
    );
  });
});

describe("convertRoutineDetailToWorkoutDetailInput", () => {
  it("routineDetail과 workoutId를 전달받아 올바르게 새로운 workoutDetail로 반환한다", () => {
    const createDetailSpy = jest
      .spyOn(workoutDetailAdapter, "createWorkoutDetail")
      .mockImplementation((input) => createBaseWorkoutDetailMock(input));

    const routineDetail: LocalRoutineDetail = mockRoutineDetail.past;
    const workoutId = 100;

    workoutDetailAdapter.convertRoutineDetailToWorkoutDetailInput(
      routineDetail,
      workoutId
    );

    expect(createDetailSpy).toHaveBeenCalledTimes(1);

    expect(createDetailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        // routineDetail에서 그대로 복사되어야 할 속성
        exerciseId: routineDetail.exerciseId,
        exerciseName: routineDetail.exerciseName,
        weight: routineDetail.weight,
        reps: routineDetail.reps,
        rpe: routineDetail.rpe,
        setType: routineDetail.setType,
        setOrder: routineDetail.setOrder,
        exerciseOrder: routineDetail.exerciseOrder,

        // 새로 추가/변경되는 속성
        isDone: false,
        workoutId: workoutId,
      })
    );
    const actualArg = createDetailSpy.mock.calls[0][0];
    expect(actualArg).not.toHaveProperty("id");
    expect(actualArg).not.toHaveProperty("routineId");
    expect(actualArg).not.toHaveProperty("isSynced");
  });
});
