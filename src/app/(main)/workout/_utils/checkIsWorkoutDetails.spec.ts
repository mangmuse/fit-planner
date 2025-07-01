import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import {
  isWorkoutDetail,
  isWorkoutDetails,
} from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";

const mockWD = mockWorkoutDetail.past;
const mockRD = mockRoutineDetail.past;
describe("isWorkoutDetails", () => {
  it("빈배열을 입력하면 true를 반환해야 한다", () => {
    const result = isWorkoutDetails([]);
    expect(result).toBe(true);
  });

  it("배열 내의 아이템이 workoutId를 가지고 있으면 true를 반환해야 한다", () => {
    const result = isWorkoutDetails([mockWD]);

    expect(mockWD.workoutId).toBeDefined();
    expect(result).toBe(true);
  });

  it("배열 내의 아이템이 workoutId를 가지고 있지 않으면 false를 반환해야 한다", () => {
    const result = isWorkoutDetails([mockRD]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((mockRD as any).workoutId).toBeUndefined();
    expect(result).toBe(false);
  });
});

describe("isWorkoutDetail", () => {
  it("workoutId를 가지고 있으면 true를 반환해야 한다", () => {
    const result = isWorkoutDetail(mockWD);
    expect(result).toBe(true);
  });

  it("workoutId를 가지고 있지 않으면 false를 반환해야 한다", () => {
    const result = isWorkoutDetail(mockRD);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((mockRD as any).workoutId).toBeUndefined();
    expect(result).toBe(false);
  });
});
