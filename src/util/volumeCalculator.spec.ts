import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import {
  calculateTotalVolume,
  calculateVolumeFromDetails,
} from "./volumeCalculator";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { SessionGroup } from "@/hooks/useLoadDetails";
import { KG_TO_LBS } from "@/util/weightConversion";
import { LocalRoutineDetail, LocalWorkoutDetail, Saved } from "@/types/models";

const mockRD = mockRoutineDetail.past;
const mockWD = mockWorkoutDetail.past;

describe("volumeCalculator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("단위 변환 상수", () => {
    it("KG_TO_LBS 상수가 올바른 값을 가져야 한다", () => {
      expect(KG_TO_LBS).toBe(2.205);
    });

    it("변환 함수들이 일관성을 가져야 한다", () => {
      const testWeight = 100;
      const convertedToLbs = testWeight * KG_TO_LBS;
      const convertedBackToKg = convertedToLbs / KG_TO_LBS;
      expect(convertedBackToKg).toBeCloseTo(testWeight, 10);
    });
  });

  describe("calculateVolumeFromDetails", () => {
    it("빈 배열인경우 0을 반환해야한다", () => {
      const details = [];
      const result = calculateVolumeFromDetails(details, "kg");
      expect(result).toBe(0);
    });

    describe("엣지 케이스", () => {
      it("null/undefined weight와 reps를 0으로 처리해야 한다", () => {
        const details = [
          { ...mockWD, weight: null, reps: 10, weightUnit: "kg" },
          { ...mockWD, weight: 100, reps: null, weightUnit: "kg" },
          {
            ...mockWD,
            weight: undefined,
            reps: undefined,
            weightUnit: "kg",
          },
        ] as Saved<LocalWorkoutDetail>[];
        const result = calculateVolumeFromDetails(details, "kg");
        expect(result).toBe(0);
      });

      it("음수 weight와 reps를 올바르게 처리해야 한다", () => {
        const details: Saved<LocalWorkoutDetail>[] = [
          { ...mockWD, weight: -100, reps: 10, weightUnit: "kg" },
          { ...mockWD, weight: 100, reps: -10, weightUnit: "kg" },
        ];
        const result = calculateVolumeFromDetails(details, "kg");
        expect(result).toBe(-2000);
      });
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

        const result = calculateVolumeFromDetails(details, "kg");
        const result2 = calculateVolumeFromDetails(details2, "kg");

        expect(result).toBe(14000);
        expect(result).toMatchSnapshot();

        expect(result2).toBe(0);
        expect(result2).toMatchSnapshot();
      });

      describe("서로 다른 weightUnit이 혼합된 경우 올바르게 볼륨을 계산한다", () => {
        it("kg 단위로 올바르게 볼륨을 계산한다", () => {
          const details: Saved<LocalWorkoutDetail>[] = [
            { ...mockWD, weight: 100, reps: 10, weightUnit: "kg" },
            { ...mockWD, weight: 200, reps: 20, weightUnit: "lbs" },
          ];
          const result = calculateVolumeFromDetails(details, "kg");
          const expected = 100 * 10 + (200 / KG_TO_LBS) * 20;
          expect(result).toBeCloseTo(expected, 2);
          expect(result).toMatchSnapshot();
        });
        it("lbs 단위로 올바르게 볼륨을 계산한다", () => {
          const details: Saved<LocalWorkoutDetail>[] = [
            { ...mockWD, weight: 100 * KG_TO_LBS, reps: 10, weightUnit: "lbs" },
            { ...mockWD, weight: 200, reps: 20, weightUnit: "kg" },
          ];
          const result = calculateVolumeFromDetails(details, "lbs");
          const expected = 100 * KG_TO_LBS * 10 + 200 * KG_TO_LBS * 20;
          expect(result).toBeCloseTo(expected, 2);
          expect(result).toMatchSnapshot();
        });
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

        const result = calculateVolumeFromDetails(details, "kg");
        const result2 = calculateVolumeFromDetails(details2, "kg");

        expect(result).toBe(14000);
        expect(result).toMatchSnapshot();

        expect(result2).toBe(0);
        expect(result2).toMatchSnapshot();
      });
    });
    describe("서로 다른 weightUnit이 혼합된 경우 올바르게 볼륨을 계산한다", () => {
      it("kg 단위로 올바르게 볼륨을 계산한다", () => {
        const details: Saved<LocalRoutineDetail>[] = [
          { ...mockRD, weight: 100, reps: 10, weightUnit: "kg" },
          { ...mockRD, weight: 200, reps: 20, weightUnit: "lbs" },
        ];
        const result = calculateVolumeFromDetails(details, "kg");
        const expected = 100 * 10 + (200 / KG_TO_LBS) * 20;
        expect(result).toBeCloseTo(expected, 2);
        expect(result).toMatchSnapshot();
      });
      it("lbs 단위로 올바르게 볼륨을 계산한다", () => {
        const details: Saved<LocalRoutineDetail>[] = [
          { ...mockRD, weight: 100 * KG_TO_LBS, reps: 10, weightUnit: "lbs" },
          { ...mockRD, weight: 200, reps: 20, weightUnit: "kg" },
        ];
        const result = calculateVolumeFromDetails(details, "lbs");
        const expected = 100 * KG_TO_LBS * 10 + 200 * KG_TO_LBS * 20;
        expect(result).toBeCloseTo(expected, 2);
        expect(result).toMatchSnapshot();
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

    const mockWorkoutGroup3: SessionGroup = {
      exerciseOrder: 3,
      details: [
        { ...mockWD, weight: 400 * KG_TO_LBS, reps: 40, weightUnit: "lbs" },
        { ...mockWD, weight: 500, reps: 50, weightUnit: "kg" },
      ],
    };

    it("빈 배열인 경우 0을 반환해야한다", () => {
      const workoutGroups = [];
      const result = calculateTotalVolume(workoutGroups, "kg");
      expect(result).toBe(0);
    });

    const workoutGroups: SessionGroup[] = [
      mockWorkoutGroup1,
      mockWorkoutGroup2,
    ];

    describe("올바르게 볼륨을 계산한다", () => {
      it("kg 단위로 올바르게 볼륨을 계산한다", () => {
        const result = calculateTotalVolume(workoutGroups, "kg");
        expect(result).toBe(14000);
        expect(result).toMatchSnapshot();
      });

      it("lbs 단위로 올바르게 볼륨을 계산한다", () => {
        const result = calculateTotalVolume(workoutGroups, "lbs");

        const expected = 14000 * KG_TO_LBS;
        expect(result).toBeCloseTo(expected, 2);
        expect(result).toMatchSnapshot();
      });

      it("서로 다른 weightUnit이 혼합된 경우 올바르게 볼륨을 계산한다", () => {
        const workoutGroups = [
          mockWorkoutGroup1,
          mockWorkoutGroup2,
          mockWorkoutGroup3,
        ];
        const result = calculateTotalVolume(workoutGroups, "kg");
        const expected = 14000 + 400 * 40 + 500 * 50;
        expect(result).toBe(expected);
        expect(result).toMatchSnapshot();
      });
    });
  });
});
