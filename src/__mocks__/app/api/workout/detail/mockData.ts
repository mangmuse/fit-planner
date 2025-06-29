import { createMock, DeepPartial } from "@/lib/test/createMock";
import { WorkoutDetailWithIncludes } from "@/app/api/workout/detail/route";

export const createPrismaWorkoutDetailResponse = (
  overrides?: DeepPartial<WorkoutDetailWithIncludes>
): WorkoutDetailWithIncludes => {
  const defaultWorkoutDetail: WorkoutDetailWithIncludes = {
    id: "workout-detail-1",
    workoutId: "workout-1",
    exerciseId: 1,
    weight: 60,
    rpe: null,
    exerciseOrder: 1,
    reps: 10,
    setOrder: 1,
    isDone: false,
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-01T10:00:00Z"),
    setType: "NORMAL",
    exercise: {
      name: "벤치프레스",
    },
  };
  return createMock(defaultWorkoutDetail, overrides);
};
