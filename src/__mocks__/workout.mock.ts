import { ClientWorkout } from "../types/models";
import {
  FetchWorkoutsResponse,
  SyncWorkoutsToServerResponse,
} from "@/api/workout.api";
import { mockUserId } from "@/__mocks__/src/api";
import { LocalWorkout } from "@/types/models";
import { getFormattedDateYMD } from "@/util/formatDate";

const createBaseWorkoutMock = (
  overrides?: Partial<LocalWorkout>
): LocalWorkout => ({
  id: Math.floor(Math.random() * 1000),
  userId: "mockUserId",
  date: getFormattedDateYMD(new Date()), // 오늘 날짜
  status: "EMPTY",
  isSynced: true,
  serverId: `server-id-${Math.random()}`,
  createdAt: new Date().toISOString(),
  updatedAt: null,

  ...overrides,
});

export const createServerWorkoutMock = (
  overrides?: Partial<ClientWorkout>
): ClientWorkout => ({
  id: `server-id-${Math.random()}`,
  date: new Date().toISOString(),
  userId: "mockUserId",
  status: "EMPTY",
  createdAt: new Date().toISOString(),
  updatedAt: null,
  ...overrides,
});

export const mockWorkout = {
  default: createBaseWorkoutMock(),

  empty: createBaseWorkoutMock({
    id: 1,
    status: "EMPTY",
    isSynced: false,
    serverId: null,
  }),
  planned: createBaseWorkoutMock({
    id: 2,
    status: "PLANNED",
    isSynced: false,
    serverId: null,
  }),
  unsynced: createBaseWorkoutMock({
    id: 3,
    status: "COMPLETED",
    isSynced: false,
    serverId: "server-workout-xyz",
  }),

  synced: createBaseWorkoutMock({
    id: 3,
    status: "COMPLETED",
    isSynced: true,
    serverId: "server-workout-xyz",
  }),

  server: createServerWorkoutMock(),
};
// ======== Mock Server Response ========

export const mockFetchWorkoutsResponse: FetchWorkoutsResponse = {
  success: true,
  workouts: [mockWorkout.server],
};

export const mockPostWorkoutsToServerResponse: SyncWorkoutsToServerResponse = {
  success: true,
  updated: [
    { localId: 1, serverId: "mock-server-id-1" },
    { localId: 2, serverId: "mock-server-id-2" },
    { localId: 3, serverId: "mock-server-id-3" },
  ],
};

// ---------

export const mockWorkoutServerId = "a11fe018-2dfc-456b-8dfb-4656c1d4be12";

export const mockLocalWorkouts: LocalWorkout[] = [
  {
    id: 1,
    userId: mockUserId,
    date: "2025-02-11",
    isSynced: false,
    status: "EMPTY",
    serverId: mockWorkoutServerId,
    createdAt: "2025-02-11T02:50:05.917Z",
  },
  {
    id: 2,
    userId: mockUserId,
    date: "2025-02-10",
    isSynced: false,
    status: "EMPTY",
    serverId: mockWorkoutServerId,
    createdAt: "2025-02-10T02:50:05.917Z",
  },
  {
    id: 3,
    userId: mockUserId,
    date: "2025-02-09",
    isSynced: false,
    status: "EMPTY",
    serverId: mockWorkoutServerId,
    createdAt: "2025-02-09T02:50:05.917Z",
  },
];

export const mockServerWorkouts: ClientWorkout[] = [
  {
    id: mockWorkoutServerId,
    date: new Date("2025-02-11").toISOString(),
    userId: mockUserId,
    status: "EMPTY",
    createdAt: "2025-02-11T02:50:05.917Z",
  },
  {
    id: mockWorkoutServerId,
    date: new Date("2025-02-10").toISOString(),
    userId: `${mockWorkoutServerId}2`,
    status: "EMPTY",
    createdAt: "2025-02-10T02:50:05.917Z",
  },
  {
    id: mockWorkoutServerId,
    date: new Date("2025-02-09").toISOString(),
    userId: `${mockWorkoutServerId}3`,
    status: "EMPTY",
    createdAt: "2025-02-09T02:50:05.917Z",
  },
];

export const mockInvalidFetchWorkoutsResponse = {
  success: "true",
  workouts: mockServerWorkouts,
};

export const mockInvalidPostWorkoutsToServerResponse = {
  success: true,
  updated: [
    { localId: 1, serverId: 1 },
    { localId: 2, serverId: `${mockWorkoutServerId}2` },
    { localId: 3, serverId: `${mockWorkoutServerId}3` },
  ],
};
