import {
  FetchExercisesResponse,
  SyncExercisesToServerResponse,
} from "@/api/exercise.api";
import { ClientExercise, LocalExercise } from "@/types/models";

export const createMockExercise = (
  overrides?: Partial<LocalExercise>
): LocalExercise => ({
  id: Math.floor(Math.random() * 1000),
  name: "기본 운동",
  category: "가슴",
  imageUrl: "https://example.com/default.png",
  isBookmarked: false,
  isCustom: false,
  isSynced: true,
  serverId: Math.random(),
  unit: "kg",
  exerciseMemo: null,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: null,
  userId: "mockUserId",
  ...overrides,
});

export const createMockServerExercise = (
  overrides?: Partial<ClientExercise>
): ClientExercise => ({
  id: Math.floor(Math.random() * 1000),
  name: "서버 운동",
  category: "가슴",
  isCustom: false,
  isBookmarked: false,
  unit: "kg",
  exerciseMemo: null,
  createdAt: new Date().toISOString(),
  userId: null,
  imageUrl: "https://example.com/server.png",
  ...overrides,
});

export const mockExercise = {
  bookmarked: createMockExercise({
    id: 100,
    name: "북마크된 벤치프레스",
    isBookmarked: true,
  }),

  synced: createMockExercise({
    id: 100,
    name: "동기화된 벤치프레스",
    isSynced: true,
    serverId: 200,
  }),

  server: createMockServerExercise(),

  list: [
    createMockExercise({
      id: 1,
      name: "벤치프레스",
      category: "가슴",
      isBookmarked: true,
    }),
    createMockExercise({
      id: 2,
      name: "스쿼트",
      category: "하체",
      isBookmarked: true,
    }),
    createMockExercise({
      id: 3,
      name: "데드리프트",
      category: "등",
      isBookmarked: false,
    }),
    createMockExercise({
      id: 4,
      name: "오버헤드 프레스",

      category: "어깨",
      isBookmarked: true,
    }),
    createMockExercise({
      id: 5,
      name: "나만의 등 운동",
      category: "등",
      isCustom: true,
      isBookmarked: true,
    }),
  ],
};

// ----

// ======== Mock Server Response ========

/**
 * GET /api/exercises/all
 */
export const mockFetchExercisesResponse: FetchExercisesResponse = {
  success: true,
  exercises: [mockExercise.server],
};

/**
 * POST /api/exercises/sync
 */
export const mockpostExercisesResponse: SyncExercisesToServerResponse = {
  success: true,
  updated: [
    { localId: 1, serverId: mockExercise.server.id },
    { localId: 2, serverId: mockExercise.server.id },
  ],
};
