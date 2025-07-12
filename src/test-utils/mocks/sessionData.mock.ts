import { SessionData } from "@/app/(main)/_shared/session/SessionContainer";
import { LocalRoutineDetail, LocalWorkoutDetail, Saved } from "@/types/models";

export type SessionDataMock = {
  updateDetailInGroups: jest.Mock;
  updateMultipleDetailsInGroups: jest.Mock;
  addDetailToGroup: jest.Mock;
  removeDetailFromGroup: jest.Mock;
  removeMultipleDetailsInGroup: jest.Mock;
  reorderAfterDelete: jest.Mock;
  reorderExerciseOrderAfterDelete: jest.Mock;
  reorderSetOrderAfterDelete: jest.Mock;
  sessionGroup: Array<{
    exerciseOrder: number;
    details: Array<Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>>;
  }>;
};

export const createMockSessionData = (
  overrides?: Partial<SessionData>
): SessionData => {
  return {
    updateDetailInGroups: jest.fn(),
    updateMultipleDetailsInGroups: jest.fn(),
    addDetailToGroup: jest.fn(),
    removeDetailFromGroup: jest.fn(),
    removeMultipleDetailsInGroup: jest.fn(),
    reload: jest.fn(),
    reorderExerciseOrderAfterDelete: jest.fn(),
    reorderSetOrderAfterDelete: jest.fn(),
    sessionGroup: [],
    ...overrides,
  };
};

export const setupSessionDataMock = () => {
  const mockUseSessionData = jest.fn();
  const defaultMock = createMockSessionData();

  mockUseSessionData.mockReturnValue(defaultMock);

  return {
    mockUseSessionData,
    defaultMock,
    updateMock: (overrides: Partial<SessionData>) => {
      const newMock = createMockSessionData(overrides);
      mockUseSessionData.mockReturnValue(newMock);
      return newMock;
    },
  };
};
