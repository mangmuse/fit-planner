import { WorkoutDetailWithExercise } from "@/app/api/workout/detail/route";
import { createMock, DeepPartial } from "@/lib/test/createMock";

export const createPrismaWorkoutDetailResponse = (
  overrides?: DeepPartial<WorkoutDetailWithExercise>
): WorkoutDetailWithExercise => {
  const defaultWorkoutDetail: WorkoutDetailWithExercise = {
    id: "workout-detail-1",
    workoutId: "workout-1",
    exerciseId: 1,
    exerciseOrder: 1,
    setOrder: 1,
    weight: 60,
    reps: 10,
    rpe: null,
    setType: "NORMAL",
    isDone: false,
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-01T10:00:00Z"),
    exercise: {
      name: "벤치프레스",
    },
  };
  return createMock(defaultWorkoutDetail, overrides);
};

export const createPrismaWorkoutDetailListResponse = (
  count: number = 3,
  overrides?: DeepPartial<WorkoutDetailWithExercise>
): WorkoutDetailWithExercise[] => {
  return Array.from({ length: count }, (_, index) =>
    createPrismaWorkoutDetailResponse({
      ...overrides,
      id: `workout-detail-${index + 1}`,
      setOrder: index + 1,
    })
  );
};
