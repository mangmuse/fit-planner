import { INITIAL_ROUTINE_DETAIL_BASE } from "./../adapter/routineDetail.adapter";
import { LocalRoutineDetail } from "@/types/models";

export const createBaseRoutineDetailMock = (
  overrides?: Partial<LocalRoutineDetail>
): LocalRoutineDetail => ({
  ...INITIAL_ROUTINE_DETAIL_BASE,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const mockRoutineDetail = {
  createInput: (overrides?: Partial<LocalRoutineDetail>) =>
    createBaseRoutineDetailMock(overrides),

  new: (overrides?: Partial<LocalRoutineDetail>) =>
    createBaseRoutineDetailMock(overrides),

  past: createBaseRoutineDetailMock({
    id: 123,
    reps: 5,
    weight: 60,

    updatedAt: "2025-06-17T10:00:00.000Z",
  }),
};
