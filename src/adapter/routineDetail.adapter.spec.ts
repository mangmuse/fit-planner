import { createMockExercise } from "@/__mocks__/exercise.mock";
import { createBaseRoutineMock } from "@/__mocks__/routine.mock";
import {
  createBaseRoutineDetailMock,
  mockRoutineDetail,
} from "@/__mocks__/routineDetail.mock";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";

import {
  RoutineDetailAdapter,
  INITIAL_ROUTINE_DETAIL_BASE,
} from "@/adapter/routineDetail.adapter";

const routineDetailAdapter = new RoutineDetailAdapter();
import { LocalRoutineDetail } from "@/types/models";

describe("getInitialWorkoutDetail", () => {
  it("초기 routine detail 객체를 반환한다", () => {
    const result = routineDetailAdapter.getInitialRoutineDetail();

    const expectedBase = INITIAL_ROUTINE_DETAIL_BASE;

    expect(result).toEqual(expect.objectContaining(expectedBase));
    expect(result.createdAt).toEqual(expect.any(String));
  });
});

describe("createRoutineDetail", () => {
  const override: Partial<LocalRoutineDetail> = {
    exerciseName: "테스트 운동",
    exerciseId: 2,
    exerciseOrder: 2,
    setOrder: 2,
    routineId: 2,
  };
  it("초기 routineDetail 객체에 필요한 부분만 override 하여 반환한다", () => {
    const initialDetailMock = createBaseRoutineDetailMock();
    jest
      .spyOn(routineDetailAdapter, "getInitialRoutineDetail")
      .mockReturnValue(initialDetailMock);

    const result = routineDetailAdapter.createRoutineDetail(override);
    const expected = { ...initialDetailMock, ...override };

    expect(result).toEqual(expect.objectContaining(expected));
  });

  const missingPropertyCases = [
    { propertyName: "exerciseName" }, //
    { propertyName: "exerciseId" },
    { propertyName: "exerciseOrder" },
    { propertyName: "setOrder" },
    { propertyName: "routineId" },
  ];

  it.each(missingPropertyCases)(
    "$propertyName 속성이 없으면 에러를 던져야 한다",
    ({ propertyName }) => {
      const invalidOverride = { ...override };
      delete invalidOverride[propertyName as keyof typeof invalidOverride];
      expect(() => {
        routineDetailAdapter.createRoutineDetail(invalidOverride);
      }).toThrow(
        "exerciseName, exerciseId, exerciseOrder, setOrder, routineId 는 필수 입력사항입니다."
      );
    }
  );
});

describe("getNewRoutineDetails", () => {
  it("선택된 운동 목록만큼 createWokroutDetail을 올바른 인자와 함께 호출해야 한다", () => {
    const selectedExercises = [
      { id: 1, name: "벤치프레스" },
      { id: 2, name: "스쿼트" },
    ];
    const newWorkoutInput = { routineId: 100, startOrder: 10 };

    const createDetailSpy = jest
      .spyOn(routineDetailAdapter, "createRoutineDetail")
      .mockImplementation((input: Partial<LocalRoutineDetail>) =>
        createBaseRoutineDetailMock(input)
      );

    const result = routineDetailAdapter.getNewRoutineDetails(
      selectedExercises,
      newWorkoutInput
    );

    expect(result).toHaveLength(2);
    expect(result[0].exerciseName).toBe("벤치프레스");
    expect(result[0].exerciseOrder).toBe(10);
    expect(result[1].exerciseName).toBe("스쿼트");
    expect(result[1].exerciseOrder).toBe(11);
    expect(createDetailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        routineId: 100,
        exerciseName: "벤치프레스",
        exerciseOrder: 10,
      })
    );
    expect(createDetailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        routineId: 100,
        exerciseName: "스쿼트",
        exerciseOrder: 11,
      })
    );
  });
});

describe("getAddSetToRoutineByLastSet", () => {
  it("초기 routineDetail 객체에 인자로 받은 디테일의 일부를 올바르게 덮어씌워 반환한다", () => {
    const lastSet = { ...mockRoutineDetail.past };
    const createDetailSpy = jest
      .spyOn(routineDetailAdapter, "createRoutineDetail")
      .mockImplementation((input) => createBaseRoutineDetailMock(input));

    routineDetailAdapter.getAddSetToRoutineByLastSet(lastSet);

    expect(createDetailSpy).toHaveBeenCalledTimes(1);

    expect(createDetailSpy).toHaveBeenCalledWith({
      // 복사되어야 하는 속성
      exerciseId: lastSet.exerciseId,
      exerciseName: lastSet.exerciseName,
      exerciseOrder: lastSet.exerciseOrder,
      setType: lastSet.setType,
      weight: lastSet.weight,
      reps: lastSet.reps,
      routineId: lastSet.routineId,

      // 초기화 되어야하는 속성
      rpe: 0,
      serverId: null,
      isSynced: false,
      setOrder: lastSet.setOrder + 1,
      createdAt: expect.any(String),
    });
  });

  it("lastSet의 createdAt이 아닌, 함수 호출 시점의 새로운 createdAt 값으로 덮어쓴다", () => {
    const lastSet = {
      ...mockRoutineDetail.past,
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    const MOCK_NOW = new Date("2025-06-18T10:30:00.000Z");

    const dateSpy = jest
      .spyOn(global, "Date")
      .mockImplementation(() => MOCK_NOW);

    const createDetailSpy = jest
      .spyOn(routineDetailAdapter, "createRoutineDetail")
      .mockImplementation((input: Partial<LocalRoutineDetail>) =>
        createBaseRoutineDetailMock(input)
      );

    routineDetailAdapter.getAddSetToRoutineByLastSet(lastSet);

    expect(createDetailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: MOCK_NOW.toISOString(),
      })
    );

    dateSpy.mockRestore();
  });
});

describe("mapPastWorkoutToRoutineDetail", () => {
  const pastWorkoutDetail = mockWorkoutDetail.past;
  const routineId = 123;
  const exerciseOrder = 10;
  it("인자로 받은 workoutDetail과 routineId, exerciseOrder를 기반으로 routineDetail을 생성한다", () => {
    jest
      .spyOn(routineDetailAdapter, "getInitialRoutineDetail")
      .mockReturnValue(createBaseRoutineDetailMock());

    const result = routineDetailAdapter.mapPastWorkoutToRoutineDetail(
      pastWorkoutDetail,
      routineId,
      exerciseOrder
    );

    expect(result).toMatchObject({
      // 복사할 속성
      exerciseId: pastWorkoutDetail.exerciseId,
      exerciseName: pastWorkoutDetail.exerciseName,
      setOrder: pastWorkoutDetail.setOrder,
      weight: pastWorkoutDetail.weight,
      reps: pastWorkoutDetail.reps,
      rpe: pastWorkoutDetail.rpe,
      setType: pastWorkoutDetail.setType,

      // 새로운 값
      routineId: routineId,
      exerciseOrder: exerciseOrder,

      // 초기화
      isSynced: false,
      serverId: null,
    });

    expect(result.id).toBeUndefined();
  });

  it("createdAt은 함수 호출시점의 새로운 날짜로 변경된다", () => {
    const MOCK_NOW = new Date("2025-06-18T10:30:00.000Z");

    const dateSpy = jest
      .spyOn(global, "Date")
      .mockImplementation(() => MOCK_NOW);

    const result = routineDetailAdapter.mapPastWorkoutToRoutineDetail(
      pastWorkoutDetail,
      routineId,
      exerciseOrder
    );

    expect(result.createdAt).toBe(MOCK_NOW.toISOString());

    dateSpy.mockRestore();
  });
});

describe("mapLocalRoutineDetailToServer", () => {
  it("전달받은 detail의 exerciseId와 routineId를 serverId로 매핑한다", () => {
    const mockExercise = createMockExercise({ id: 10, serverId: 100 });
    const mockRoutine = createBaseRoutineMock({
      id: 10,
      serverId: "server-id",
    });
    const mockDetail = createBaseRoutineDetailMock({
      exerciseId: mockExercise.id,
      routineId: mockRoutine.id,
      weight: 50,
      reps: 10,
    });
    const expectedResult = {
      ...mockDetail,
      exerciseId: mockExercise.serverId,
      routineId: mockRoutine.serverId,
    };

    const result = routineDetailAdapter.mapLocalRoutineDetailToServer(
      mockDetail,
      mockExercise,
      mockRoutine
    );

    expect(result).toEqual(expectedResult);
  });

  it("전달받은 exercise나 routine에 serverId가 없을경우 에러를 던진다", () => {
    const mockExercise = createMockExercise({ id: 10, serverId: null });
    const mockRoutine = createBaseRoutineMock({
      id: 10,
      serverId: null,
    });
    const mockDetail = createBaseRoutineDetailMock({
      exerciseId: mockExercise.id,
      routineId: mockRoutine.id,
      weight: 50,
      reps: 10,
    });

    expect(() =>
      routineDetailAdapter.mapLocalRoutineDetailToServer(
        mockDetail,
        mockExercise,
        mockRoutine
      )
    ).toThrow("exerciseId 또는 routineId가 없습니다");
  });
});

describe("cloneToCreateInput", () => {
  it("전달받은 detail을 기반으로 createInput을 생성한다", () => {
    const mockDetail = mockRoutineDetail.past;
    const result = routineDetailAdapter.cloneToCreateInput(mockDetail, 200);

    expect(result).toEqual(
      expect.objectContaining({
        exerciseId: mockDetail.exerciseId,
        exerciseName: mockDetail.exerciseName,
        exerciseOrder: mockDetail.exerciseOrder,
        setOrder: mockDetail.setOrder,
        weight: mockDetail.weight,
        reps: mockDetail.reps,
        rpe: mockDetail.rpe,
        setType: mockDetail.setType,
        routineId: 200,
        createdAt: expect.any(String),
        serverId: null,
        isSynced: false,
      })
    );
    expect(result).not.toHaveProperty("id");
  });
});

describe("cloneToCreateInput", () => {
  it("기존 detail에서 불필요한 속성을 제거하고, 복제에 필요한 값들을 새로 설정하여 반환한다", () => {
    const originalDetail: LocalRoutineDetail = {
      ...mockRoutineDetail.past,
      id: 10,
      routineId: 100,
      serverId: "server-abc",
      isSynced: true,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    };
    const newRoutineId = 200;

    const result = routineDetailAdapter.cloneToCreateInput(
      originalDetail,
      newRoutineId
    );

    expect(result).not.toHaveProperty("id");

    const {
      id,
      routineId,
      serverId,
      isSynced,
      createdAt,
      updatedAt,
      ...restOfOriginal
    } = originalDetail;

    const expectedObject = {
      ...restOfOriginal,
      routineId: newRoutineId,
      serverId: null,
      isSynced: false,
      updatedAt: null,
      createdAt: expect.any(String),
    };

    expect(result).toMatchObject(expectedObject);
  });
});
