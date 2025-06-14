import { ClientWorkout } from "../types/models";
import { SyncWorkoutsToServerResponse } from "@/api/workout.api";
import { mockUserId } from "@/__mocks__/src/api";
import { LocalWorkout } from "@/types/models";

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

export const mockFetchWorkoutsResponse = {
  success: true,
  workouts: mockServerWorkouts,
};

export const mockInvalidFetchWorkoutsResponse = {
  success: "true",
  workouts: mockServerWorkouts,
};

export const mockPostWorkoutsToServerResponse: SyncWorkoutsToServerResponse = {
  success: true,
  updated: [
    { localId: 1, serverId: mockWorkoutServerId },
    { localId: 2, serverId: `${mockWorkoutServerId}2` },
    { localId: 3, serverId: `${mockWorkoutServerId}3` },
  ],
};
export const mockInvalidPostWorkoutsToServerResponse = {
  success: true,
  updated: [
    { localId: 1, serverId: 1 },
    { localId: 2, serverId: `${mockWorkoutServerId}2` },
    { localId: 3, serverId: `${mockWorkoutServerId}3` },
  ],
};
