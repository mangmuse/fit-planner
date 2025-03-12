import { mockWorkoutServerId } from "@/__mocks__/workout.mock";
import {
  FetchWorkoutDetailsResponse,
  SyncWorkoutDetailsToServerResponse,
} from "@/api/workoutDetail.api";
import {
  ClientWorkoutDetail,
  LocalWorkoutDetail,
  LocalWorkoutDetailWithServerWorkoutId,
} from "@/types/models";

export const mockWorkoutDetailId = "b6d6a28e-5709-4fe5-80f9-11bfb8bf0a64";

export const mockLocalWorkoutDetails: LocalWorkoutDetailWithServerWorkoutId[] =
  [
    {
      id: 1,
      exerciseId: 102,
      exerciseName: "스쿼트",
      exerciseOrder: 1,
      isDone: false,
      isSynced: false,
      reps: 0,
      weight: 0,
      rpe: null,
      setOrder: 1,
      setType: "NORMAL",
      serverId: mockWorkoutDetailId,
      workoutId: mockWorkoutServerId,
      createdAt: "2025-02-11T02:50:05.917Z",
    },
    {
      id: 2,
      exerciseId: 101,
      exerciseName: "벤치프레스",
      exerciseOrder: 2,
      isDone: false,
      isSynced: false,
      reps: 0,
      weight: 0,
      rpe: null,
      setOrder: 1,
      setType: "NORMAL",
      serverId: mockWorkoutDetailId,
      workoutId: mockWorkoutServerId,
      createdAt: "2025-02-11T02:50:05.917Z",
    },
    {
      id: 3,
      exerciseId: 103,
      exerciseName: "데드리프트",
      exerciseOrder: 3,
      isDone: false,
      isSynced: false,
      reps: 0,
      weight: 0,
      rpe: null,
      setOrder: 1,
      setType: "NORMAL",
      serverId: mockWorkoutDetailId,
      workoutId: mockWorkoutServerId,
      createdAt: "2025-02-11T02:50:05.917Z",
    },
  ];

export const mockServerWorkoutDetails: ClientWorkoutDetail[] = [
  {
    id: mockWorkoutDetailId,
    isDone: false,
    exerciseId: 3,
    exerciseName: "스쿼트",
    reps: null,
    rpe: null,
    weight: null,
    createdAt: "2025-02-11T02:50:05.917Z",
    setType: "NORMAL",
    exerciseOrder: 1,
    setOrder: 1,
    workoutId: mockWorkoutServerId,
  },
  {
    id: `${mockWorkoutDetailId}2`,
    isDone: false,
    exerciseId: 1,
    exerciseName: "푸시업",
    reps: null,
    rpe: null,
    weight: null,
    createdAt: "2025-02-11T02:50:05.917Z",
    setType: "NORMAL",
    exerciseOrder: 2,
    setOrder: 1,
    workoutId: mockWorkoutServerId,
  },
  {
    id: `${mockWorkoutDetailId}3`,
    isDone: false,
    exerciseId: 2,
    exerciseName: "플랭크",
    reps: null,
    rpe: null,
    weight: null,
    createdAt: "2025-02-11T02:50:05.917Z",
    setType: "NORMAL",
    exerciseOrder: 3,
    setOrder: 1,
    workoutId: mockWorkoutServerId,
  },
];

export const mockfetchWorkoutDetailsResponse: FetchWorkoutDetailsResponse = {
  success: true,
  workoutDetails: mockServerWorkoutDetails,
};

export const mockInvalidFetchWorkoutDetailsResponse = {
  success: "true",
  workoutDetails: mockServerWorkoutDetails,
};

export const mockPostWorkoutDetailsToServerResponse: SyncWorkoutDetailsToServerResponse =
  {
    success: true,
    updated: [
      {
        localId: 1,
        serverId: mockWorkoutDetailId,
        exerciseId: 3,
        workoutId: mockWorkoutServerId,
      },
      {
        localId: 2,
        serverId: `${mockWorkoutDetailId}2`,
        exerciseId: 1,
        workoutId: mockWorkoutServerId,
      },
      {
        localId: 3,
        serverId: `${mockWorkoutDetailId}3`,
        exerciseId: 2,
        workoutId: mockWorkoutServerId,
      },
    ],
  };
export const mockInvalidPostWorkoutDetailsToServerResponse = {
  success: true,
  updated: [
    {
      localId: 1,
      serverId: 1,
      exerciseId: 3,
      workoutId: mockWorkoutServerId,
    },
    {
      localId: 2,
      serverId: 2,
      exerciseId: 1,
      workoutId: mockWorkoutServerId,
    },
    {
      localId: 3,
      serverId: 3,
      exerciseId: 2,
      workoutId: mockWorkoutServerId,
    },
  ],
};
