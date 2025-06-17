import { createMockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { workoutDetailAdapter } from "@/adapter/workoutDetail.adapter";

import { LocalWorkoutDetail } from "@/types/models";

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
  it("초기 workoutDetail 객체에 필요한 부분만 override 하여 반환한다", () => {
    const override: Partial<LocalWorkoutDetail> = {
      exerciseName: "테스트 운동",
      exerciseId: 2,
      exerciseOrder: 2,
      setOrder: 2,
      workoutId: 2,
    };
    const initialDetailMock = createMockWorkoutDetail();
    jest
      .spyOn(workoutDetailAdapter, "getInitialWorkoutDetail")
      .mockReturnValue(initialDetailMock);
    const result = workoutDetailAdapter.createWorkoutDetail(override);
    const expected = { ...initialDetailMock, ...override };

    expect(result).toEqual(expected);
  });
});
