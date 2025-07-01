import { INITIAL_WORKOUT_DETAIL_BASE } from "@/adapter/workoutDetail.adapter";
import {
  FetchWorkoutDetailsResponse,
  SyncWorkoutDetailsToServerResponse,
} from "@/api/workoutDetail.api";
import {
  ClientWorkoutDetail,
  LocalWorkoutDetail,
  LocalWorkoutDetailWithServerWorkoutId,
} from "@/types/models";
import { server } from "jest.setup";
import { over } from "lodash";

export const createBaseWorkoutDetailMock = (
  overrides?: Partial<LocalWorkoutDetail>
): LocalWorkoutDetail => ({
  ...INITIAL_WORKOUT_DETAIL_BASE,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createServerWorkoutDetailMock = (
  overrides?: Partial<ClientWorkoutDetail>
): ClientWorkoutDetail => ({
  id: "mock-server-id",

  createdAt: new Date().toISOString(),
  setOrder: 1,
  setType: "NORMAL",
  exerciseOrder: 1,
  exerciseName: "Mock Exercise",
  rpe: null,
  isDone: false,
  reps: 10,
  weight: 50,
  exerciseId: 1,
  workoutId: "mock-server-workout-id",
  ...overrides,
});

export const mockWorkoutDetail = {
  createInput: (overrides?: Partial<LocalWorkoutDetail>) =>
    createBaseWorkoutDetailMock(overrides),

  new: (overrides?: Partial<LocalWorkoutDetail>) =>
    createBaseWorkoutDetailMock(overrides),

  past: createBaseWorkoutDetailMock({
    id: 123,
    workoutId: 123,
    isDone: true,
    reps: 5,
    weight: 60,
    updatedAt: "2025-06-17T10:00:00.000Z",
  }),

  server: createServerWorkoutDetailMock(),

  unsynced: createBaseWorkoutDetailMock({
    id: 1,
    workoutId: 10,
    exerciseId: 5,
    isDone: false,
    isSynced: false,
    serverId: null,
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

// ======== Mock Server Response ========

export const mockFetchWorkoutDetailsResponse: FetchWorkoutDetailsResponse = {
  success: true,
  workoutDetails: [mockWorkoutDetail.server],
};

export const mockPostWorkoutDetailsToServerResponse: SyncWorkoutDetailsToServerResponse =
  {
    success: true,
    updated: [
      {
        localId: 1,
        serverId: "mock-server-id-1",
        workoutId: "mock-server-workout-id",
        exerciseId: 5,
      },
      {
        localId: 2,
        serverId: "mock-server-id-2",
        workoutId: "mock-server-workout-id",
        exerciseId: 5,
      },
      {
        localId: 3,
        serverId: "mock-server-id-3",
        workoutId: "mock-server-workout-id",
        exerciseId: 5,
      },
    ],
  };

// ---------
