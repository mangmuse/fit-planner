import { INITIAL_WORKOUT_DETAIL_BASE } from "@/adapter/workoutDetail.adapter";
import {
  ClientWorkoutDetail,
  LocalWorkoutDetail,
  LocalWorkoutDetailWithServerWorkoutId,
} from "@/types/models";

export const createBaseWorkoutDetailMock = (
  overrides?: Partial<LocalWorkoutDetail>
): LocalWorkoutDetail => ({
  ...INITIAL_WORKOUT_DETAIL_BASE,
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
    overrides?: Partial<ClientWorkoutDetail>
  ): ClientWorkoutDetail => {
    const base = createBaseWorkoutDetailMock();
    return {
      ...base,
      id: "server-id",
      exerciseId: 500,
      workoutId: "mock-server-workout-id",
      ...overrides,
    };
  },
};
