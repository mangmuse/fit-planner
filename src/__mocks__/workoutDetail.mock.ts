import { LocalWorkoutDetail } from "@/types/models";

export const createMockWorkoutDetail = (
  overrides?: Partial<LocalWorkoutDetail>
): LocalWorkoutDetail => ({
  serverId: null,
  weight: 0,
  rpe: null,
  reps: 0,
  isDone: false,
  isSynced: false,
  setOrder: 1,
  exerciseOrder: 1,
  setType: "NORMAL",
  exerciseName: "벤치프레스",
  exerciseId: 1,
  workoutId: 1,
  createdAt: new Date().toISOString(),
  ...overrides,
});
