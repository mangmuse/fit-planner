import {
  LocalWorkoutDetail,
  LocalWorkoutDetailWithServerWorkoutId,
} from "@/types/models";

export const createBaseWorkoutDetailMock = (
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

export const mockWorkoutDetail = {
  createInput: (overrides?: Partial<LocalWorkoutDetail>) =>
    createBaseWorkoutDetailMock(overrides),

  new: (overrides?: Partial<LocalWorkoutDetail>) =>
    createBaseWorkoutDetailMock(overrides),

  past: createBaseWorkoutDetailMock({
    id: 123,
    isDone: true,
    reps: 5,
    weight: 60,
    updatedAt: "2025-06-17T10:00:00.000Z",
  }),

  fromServer: (
    overrides?: Partial<LocalWorkoutDetailWithServerWorkoutId>
  ): LocalWorkoutDetailWithServerWorkoutId => {
    const base = createBaseWorkoutDetailMock();
    return {
      ...base,
      id: base.id,
      exerciseId: 500,
      workoutId: "mock-server-workout-id",
      ...overrides,
    };
  },
};
