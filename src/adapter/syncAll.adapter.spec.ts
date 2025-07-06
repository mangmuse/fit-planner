import { mockExercise } from "@/__mocks__/exercise.mock";
import { mockWorkout } from "@/__mocks__/workout.mock";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { SyncAllAdapter } from "@/adapter/syncAll.adapter";
import {
  LocalExercise,
  LocalWorkout,
  LocalWorkoutDetail,
  NestedExercise,
  Saved,
} from "@/types/models";

describe("SyncAllAdapter", () => {
  let adapter: SyncAllAdapter;
  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new SyncAllAdapter();
  });
  describe("createNestedStructure", () => {
    const mockW: Saved<LocalWorkout> = mockWorkout.planned;
    const mockWD1: Saved<LocalWorkoutDetail> = {
      ...mockWorkoutDetail.past,
      workoutId: mockW.id,
      id: 1,
    };
    const mockWD2: Saved<LocalWorkoutDetail> = {
      ...mockWorkoutDetail.past,
      workoutId: mockW.id,
      id: 2,
    };
    it("전달받은 부모와 자식을 nested형태로 변환해야한다", async () => {
      const result = adapter.createNestedStructure(
        [mockW],
        [mockWD1, mockWD2],
        "workoutId"
      );
      expect(result).toEqual([{ ...mockW, details: [mockWD1, mockWD2] }]);
    });

    it("자식이 없는경우 details는 빈 배열이어야 한다", async () => {
      const result = adapter.createNestedStructure([mockW], [], "workoutId");
      expect(result).toEqual([{ ...mockW, details: [] }]);
    });
  });

  describe("createNestedExercises", () => {
    const mockE: Saved<LocalExercise> = {
      id: 1,
      category: "하체",
      imageUrl: "",
      isCustom: false,
      name: "데드리프트",
      serverId: 1,
      isSynced: false,
      userId: "user-123",
      createdAt: new Date().toISOString(),
      isBookmarked: true,
      unit: "kg",

      exerciseMemo: {
        daily: [
          {
            content: "힘들었음",
            createdAt: new Date().toISOString(),
            date: "2025-06-05",
            updatedAt: null,
          },
        ],
        fixed: {
          content: "이운동 안맞음",
          createdAt: new Date().toISOString(),
          updatedAt: null,
        },
      },
      updatedAt: new Date().toISOString(),
    };
    it("전달받은 운동을 변환해야한다", async () => {
      const result = adapter.createNestedExercises([mockE]);

      const expected: NestedExercise[] = [
        {
          id: 1,
          category: "하체",
          imageUrl: "",
          isCustom: false,
          userId: "user-123",
          name: "데드리프트",
          serverId: 1,
          isSynced: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          userExercise: {
            isBookmarked: true,
            unit: "kg",
            fixedMemo: {
              content: "이운동 안맞음",
              createdAt: expect.any(String),
              updatedAt: null,
            },
            dailyMemos: [
              {
                content: "힘들었음",
                createdAt: expect.any(String),
                date: "2025-06-05",
                updatedAt: null,
              },
            ],
          },
        },
      ];
      expect(result).toEqual(expected);
    });

    it("userExercise 내부 값이 default인 경우 userExercise는 null이어야 한다", async () => {
      const result = adapter.createNestedExercises([
        { ...mockE, isBookmarked: false, unit: "kg", exerciseMemo: null },
      ]);

      const expected: NestedExercise[] = [
        {
          id: 1,
          category: "하체",
          imageUrl: "",
          isCustom: false,
          userId: "user-123",
          name: "데드리프트",
          serverId: 1,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          isSynced: false,
          userExercise: null,
        },
      ];
      expect(result).toEqual(expected);
    });
  });
});
