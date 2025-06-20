import { LocalRoutineDetail } from "@/types/models";

export const createBaseWorkoutDetailMock = (
  overrides?: Partial<LocalRoutineDetail>
): LocalRoutineDetail => ({
  serverId: null,
  weight: 0,
  rpe: null,
  reps: 0,
  isSynced: false,
  setOrder: 1,
  exerciseOrder: 1,
  setType: "NORMAL",
  exerciseName: "벤치프레스",
  exerciseId: 1,
  routineId: 1,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const mockRoutineDetail = {
  createInput: (overrides?: Partial<LocalRoutineDetail>) =>
    createBaseWorkoutDetailMock(overrides),

  new: (overrides?: Partial<LocalRoutineDetail>) =>
    createBaseWorkoutDetailMock(overrides),

  past: createBaseWorkoutDetailMock({
    id: 123,
    reps: 5,
    weight: 60,

    updatedAt: "2025-06-17T10:00:00.000Z",
  }),
};
