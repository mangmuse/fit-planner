import { INITIAL_ROUTINE_DETAIL_BASE } from "./../adapter/routineDetail.adapter";
import { ClientRoutineDetail, LocalRoutineDetail, Saved } from "@/types/models";
import {
  FetchRoutineDetailsResponse,
  SyncRoutineDetailsToServerResponse,
} from "@/api/routineDetail.api";

export const createBaseRoutineDetailMock = (
  overrides?: Partial<LocalRoutineDetail>
): LocalRoutineDetail => ({
  ...INITIAL_ROUTINE_DETAIL_BASE,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createServerRoutineDetailMock = (
  overrides?: Partial<ClientRoutineDetail>
): ClientRoutineDetail => ({
  id: `server-detail-${Math.random()}`,
  routineId: "server-routine-123",
  exerciseId: 100,
  exerciseName: "Mock Exercise",
  setOrder: 1,
  exerciseOrder: 1,
  weight: 50,
  reps: 10,
  rpe: 0,
  setType: "NORMAL",
  createdAt: new Date().toISOString(),
  updatedAt: null,
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
  }) as Saved<LocalRoutineDetail>,

  unsynced: createBaseRoutineDetailMock({
    id: 3,
    isSynced: false,
    serverId: null,
  }) as Saved<LocalRoutineDetail>,

  server: createServerRoutineDetailMock(),
};

// ======== Mock Server Response ========

export const mockFetchRoutineDetailsResponse: FetchRoutineDetailsResponse = {
  success: true,
  routineDetails: [mockRoutineDetail.server],
};

export const mockPostRoutineDetailsToServerResponse: SyncRoutineDetailsToServerResponse =
  {
    success: true,
    updated: [
      {
        localId: 1,
        serverId: "mock-server-detail-1",
        exerciseId: 100,
        routineId: "server-routine-123",
      },
      {
        localId: 2,
        serverId: "mock-server-detail-2",
        exerciseId: 101,
        routineId: "server-routine-456",
      },
    ],
  };
