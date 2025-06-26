import { create } from "zustand";
import { ClientRoutine, LocalRoutine } from "@/types/models";
import { getFormattedDateYMD } from "@/util/formatDate";
import {
  FetchRoutinesResponse,
  SyncRoutinesToServerResponse,
} from "@/api/routine.api";

export const createBaseRoutineMock = (
  overrides?: Partial<LocalRoutine>
): LocalRoutine => ({
  id: Math.floor(Math.random() * 1000),
  userId: "mockUserId",
  isSynced: true,
  serverId: `server-id-${Math.random()}`,

  createdAt: new Date().toISOString(),
  updatedAt: null,
  name: "새루틴",
  description: null,

  ...overrides,
});

export const createServerRoutineMock = (
  overrides?: Partial<ClientRoutine>
): ClientRoutine => ({
  id: `server-id-${Math.random()}`,
  userId: "mockUserId",
  name: "새루틴",
  description: "",
  createdAt: new Date().toISOString(),
  updatedAt: null,
  ...overrides,
});

export const mockRoutine = {
  default: createBaseRoutineMock(),

  unsynced: createBaseRoutineMock({
    id: 1,
    isSynced: false,
    serverId: null,
  }),
  synced: createBaseRoutineMock({
    id: 2,
    isSynced: true,
    serverId: "server-routine-xyz",
  }),

  server: createServerRoutineMock(),
};

// ======== Mock Server Response ========

export const mockFetchRoutinesResponse: FetchRoutinesResponse = {
  success: true,
  routines: [mockRoutine.server],
};

export const mockPostRoutinesToServerResponse: SyncRoutinesToServerResponse = {
  success: true,
  updated: [
    { localId: 1, serverId: "mock-server-id-1" },
    { localId: 2, serverId: "mock-server-id-2" },
    { localId: 3, serverId: "mock-server-id-3" },
  ],
};
