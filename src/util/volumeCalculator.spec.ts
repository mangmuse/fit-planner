import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import {
  calculateTotalVolume,
  calculateVolumeFromDetails,
} from "./volumeCalculator";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { SessionGroup } from "@/hooks/useLoadDetails";

const mockRD = mockRoutineDetail.past;
const mockWD = mockWorkoutDetail.past;

describe("calculateVolumeFromDetails", () => {
  it("빈 배열인경우 0을 반환해야한다", () => {
    const details = [];
    const result = calculateVolumeFromDetails(details);
    expect(result).toBe(0);
  });
  describe("workoutDetail", () => {
    it("올바르게 볼륨을 계산한다", () => {
      const details = [
        { ...mockWD, weight: 100, reps: 10 },
        { ...mockWD, weight: 200, reps: 20 },
        { ...mockWD, weight: 300, reps: 30 },
      ];

      const details2 = [
        { ...mockWD, weight: 0, reps: 100 },
        { ...mockWD, weight: 100, reps: 0 },
      ];

      const result = calculateVolumeFromDetails(details);
      const result2 = calculateVolumeFromDetails(details2);

      expect(result).toBe(14000);
      expect(result).toMatchSnapshot();

      expect(result2).toBe(0);
      expect(result2).toMatchSnapshot();
    });
  });

  describe("routineDetail", () => {
    it("올바르게 볼륨을 계산한다", () => {
      const details = [
        { ...mockRD, weight: 100, reps: 10 },
        { ...mockRD, weight: 200, reps: 20 },
        { ...mockRD, weight: 300, reps: 30 },
      ];

      const details2 = [
        { ...mockRD, weight: 0, reps: 100 },
        { ...mockRD, weight: 100, reps: 0 },
      ];

      const result = calculateVolumeFromDetails(details);
      const result2 = calculateVolumeFromDetails(details2);

      expect(result).toBe(14000);
      expect(result).toMatchSnapshot();

      expect(result2).toBe(0);
      expect(result2).toMatchSnapshot();
    });
  });
});

describe("calculateTotalVolume", () => {
  const mockWorkoutGroup1: SessionGroup = {
    exerciseOrder: 1,
    details: [{ ...mockWD, weight: 100, reps: 10 }],
  };
  const mockWorkoutGroup2: SessionGroup = {
    exerciseOrder: 2,
    details: [
      { ...mockWD, weight: 200, reps: 20 },
      { ...mockWD, weight: 300, reps: 30 },
    ],
  };

  it("빈 배열인 경우 0을 반환해야한다", () => {
    const workoutGroups = [];
    const result = calculateTotalVolume(workoutGroups);
    expect(result).toBe(0);
  });

  const workoutGroups: SessionGroup[] = [mockWorkoutGroup1, mockWorkoutGroup2];

  it("올바르게 볼륨을 계산한다", () => {
    const result = calculateTotalVolume(workoutGroups);
    expect(result).toBe(14000);
    expect(result).toMatchSnapshot();
  });
});
