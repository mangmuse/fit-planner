import { mockExercise } from "@/__mocks__/exercise.mock";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { mockWorkout } from "@/__mocks__/workout.mock";
import {
  createBaseWorkoutDetailMock,
  mockWorkoutDetail,
} from "@/__mocks__/workoutDetail.mock";

import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import {
  WorkoutdetailAdapter,
  INITIAL_WORKOUT_DETAIL_BASE,
} from "@/adapter/workoutDetail.adapter";

const workoutDetailAdapter = new WorkoutdetailAdapter();

describe("getInitialWorkoutDetail", () => {
  it("초기 workout detail 객체를 반환한다", () => {
    const result = workoutDetailAdapter.getInitialWorkoutDetail();

    const expectedBase = INITIAL_WORKOUT_DETAIL_BASE;

    expect(result).toEqual(expect.objectContaining(expectedBase));
    expect(result.createdAt).toEqual(expect.any(String));
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
    const createDetailSpy = jest
      .spyOn(workoutDetailAdapter, "createWorkoutDetail")
      .mockImplementation((input) => createBaseWorkoutDetailMock(input));

    workoutDetailAdapter.getAddSetToWorkoutByLastSet(lastSet, "kg");

    expect(createDetailSpy).toHaveBeenCalledTimes(1);

    expect(createDetailSpy).toHaveBeenCalledWith(
      {
        // 복사되어야 하는 속성
        exerciseId: lastSet.exerciseId,
        exerciseName: lastSet.exerciseName,
        exerciseOrder: lastSet.exerciseOrder,
        setType: lastSet.setType,
        weight: lastSet.weight,
        reps: lastSet.reps,
        weightUnit: lastSet.weightUnit,
        workoutId: lastSet.workoutId,

        // 초기화 되어야하는 속성
        rpe: 0,
        serverId: null,
        isSynced: false,
        isDone: false,
        setOrder: lastSet.setOrder + 1,
        createdAt: expect.any(String),
      },
      "kg"
    );
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

    const createDetailSpy = jest
      .spyOn(workoutDetailAdapter, "createWorkoutDetail")
      .mockImplementation((input: Partial<LocalWorkoutDetail>) =>
        createBaseWorkoutDetailMock(input)
      );

    workoutDetailAdapter.getAddSetToWorkoutByLastSet(lastSet, "kg");

    expect(createDetailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: MOCK_NOW.toISOString(),
      }),
      "kg"
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
      newWorkoutInput,
      "kg"
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
      }),
      "kg"
    );
    expect(createDetailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        workoutId: 100,
        exerciseName: "스쿼트",
        exerciseOrder: 11,
      }),
      "kg"
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

describe("mapLocalWorkoutDetailToServer", () => {
  it("전달받은 workoutDetail의 exerciseId와 workoutId 속성을 서버아이디로 매핑한다 ", async () => {
    const exerciseMock = mockExercise.synced;
    const workoutMock = mockWorkout.synced;

    const localDetail = mockWorkoutDetail.new({
      exerciseId: exerciseMock.id,
      workoutId: workoutMock.id,
    });

    const result = workoutDetailAdapter.mapLocalWorkoutDetailToServer(
      localDetail,
      exerciseMock,
      workoutMock
    );

    expect(result.exerciseId).toBe(exerciseMock.serverId);
    expect(result.workoutId).toBe(workoutMock.serverId);
  });

  it("의존 함수가 반환한 값에 serverId가 없는경우 에러를 던진다", async () => {
    const exerciseMock = { ...mockExercise.synced, serverId: null };
    const workoutMock = { ...mockWorkout.synced, serverId: null };
    const localDetail = mockWorkoutDetail.new({
      exerciseId: exerciseMock.id,
      workoutId: workoutMock.id,
    });

    // workoutDetailAdapter.mapLocalWorkoutDetailToServer(...)를
    // 화살표 함수로 감싸서 expect에 전달합니다.
    expect(() =>
      workoutDetailAdapter.mapLocalWorkoutDetailToServer(
        localDetail,
        exerciseMock,
        workoutMock
      )
    ).toThrow("exerciseId 또는 workoutId가 없습니다");
  });
});

describe("convertServerWorkoutDetailToLocal", () => {
  it("의존 함수들이 반환한 localId로 데이터를 올바르게 변환한다", () => {
    const exerciseMock = mockExercise.synced;
    const workoutMock = mockWorkout.synced;

    const localDetail = mockWorkoutDetail.fromServer({
      exerciseId: exerciseMock.serverId!,
      workoutId: workoutMock.serverId!,
    });

    const result = workoutDetailAdapter.createOverwriteWorkoutDetailPayload(
      localDetail,
      exerciseMock,
      workoutMock
    );

    expect(result.exerciseId).toBe(exerciseMock.id);
    expect(result.workoutId).toBe(workoutMock.id);
  });
  it("의존 함수가 반환한 값에 localId가 없는경우 에러를 던진다", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exerciseMock = { ...mockExercise.synced, id: null } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workoutMock = { ...mockWorkout.synced, id: null } as any;

    const localDetail = mockWorkoutDetail.fromServer({
      exerciseId: exerciseMock.serverId!,
      workoutId: workoutMock.serverId!,
    });

    expect(() =>
      workoutDetailAdapter.createOverwriteWorkoutDetailPayload(
        localDetail,
        exerciseMock,
        workoutMock
      )
    ).toThrow("exerciseId 또는 workoutId가 없습니다");
  });
});

describe("convertRoutineDetailToWorkoutDetailInput", () => {
  it("routineDetail과 workoutId를 전달받아 올바르게 새로운 workoutDetail로 반환한다", () => {
    const routineDetail = { ...mockRoutineDetail.past };
    const workoutId = 100;

    const createDetailSpy = jest
      .spyOn(workoutDetailAdapter, "createWorkoutDetail")
      .mockImplementation((input: Partial<LocalWorkoutDetail>) =>
        createBaseWorkoutDetailMock(input)
      );

    workoutDetailAdapter.convertRoutineDetailToWorkoutDetailInput(
      routineDetail,
      workoutId,
      "kg"
    );

    expect(createDetailSpy).toHaveBeenCalledTimes(1);

    expect(createDetailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        // routineDetail에서 그대로 복사되어야 할 속성
        exerciseId: routineDetail.exerciseId,
        exerciseName: routineDetail.exerciseName,
        exerciseOrder: routineDetail.exerciseOrder,
        setOrder: routineDetail.setOrder,
        setType: routineDetail.setType,
        weight: routineDetail.weight,
        reps: routineDetail.reps,
        rpe: routineDetail.rpe,

        // 새로 설정되어야 할 속성
        workoutId,
        isDone: false,
      }),
      "kg"
    );
  });

  describe("getReorderedDetailsAfterExerciseDelete", () => {
    it("exerciseOrder가 삭제된 detail의 exerciseOrder보다 큰 detail의 exerciseOrder를 1 감소시킨다", () => {
      const details = [
        { ...mockWorkoutDetail.past, exerciseOrder: 1 },
        { ...mockWorkoutDetail.past, exerciseOrder: 3 },
        { ...mockWorkoutDetail.past, exerciseOrder: 4 },
        { ...mockWorkoutDetail.past, exerciseOrder: 5 },
      ];

      const result =
        workoutDetailAdapter.getReorderedDetailsAfterExerciseDelete(details, 2);

      expect(result).toEqual([
        { ...mockWorkoutDetail.past, exerciseOrder: 2 },
        { ...mockWorkoutDetail.past, exerciseOrder: 3 },
        { ...mockWorkoutDetail.past, exerciseOrder: 4 },
      ]);
    });
    it("exerciseOrder가 삭제된 detail보다 큰 detail이 없는경우 빈 배열을 반환한다", () => {
      const details = [
        { ...mockWorkoutDetail.past, exerciseOrder: 1 },
        { ...mockWorkoutDetail.past, exerciseOrder: 2 },
      ];

      const result =
        workoutDetailAdapter.getReorderedDetailsAfterExerciseDelete(details, 2);

      expect(result).toEqual([]);
    });
  });

  describe("getReorderedDetailsAfterSetDelete", () => {
    it("setOrder가 삭제된 detail의 setOrder보다 큰 detail의 setOrder를 1 감소시킨다", () => {
      const exerciseId = 123;
      const details = [
        { ...mockWorkoutDetail.past, setOrder: 1, exerciseId },
        { ...mockWorkoutDetail.past, setOrder: 3, exerciseId },
        { ...mockWorkoutDetail.past, setOrder: 4, exerciseId },
        { ...mockWorkoutDetail.past, setOrder: 5, exerciseId },
      ];

      const result = workoutDetailAdapter.getReorderedDetailsAfterSetDelete(
        details,
        exerciseId,
        2
      );

      expect(result).toEqual([
        { ...mockWorkoutDetail.past, setOrder: 2, exerciseId },
        { ...mockWorkoutDetail.past, setOrder: 3, exerciseId },
        { ...mockWorkoutDetail.past, setOrder: 4, exerciseId },
      ]);
    });
    it("exerciseId가 다른 detail은 변경하지 않는다", () => {
      const exerciseId = 123;
      const details = [
        { ...mockWorkoutDetail.past, setOrder: 1, exerciseId },
        { ...mockWorkoutDetail.past, setOrder: 3, exerciseId },
        { ...mockWorkoutDetail.past, setOrder: 3, exerciseId: 456 },
        { ...mockWorkoutDetail.past, setOrder: 4, exerciseId: 456 },
      ];

      const result = workoutDetailAdapter.getReorderedDetailsAfterSetDelete(
        details,
        exerciseId,
        2
      );

      expect(result).toEqual([
        { ...mockWorkoutDetail.past, setOrder: 2, exerciseId },
      ]);
    });
    it("setOrder가 삭제된 detail보다 큰 detail이 없는경우 빈 배열을 반환한다", () => {
      const details = [
        { ...mockWorkoutDetail.past, setOrder: 1 },
        { ...mockWorkoutDetail.past, setOrder: 2 },
      ];

      const result = workoutDetailAdapter.getReorderedDetailsAfterSetDelete(
        details,
        1,
        2
      );

      expect(result).toEqual([]);
    });
  });
});
