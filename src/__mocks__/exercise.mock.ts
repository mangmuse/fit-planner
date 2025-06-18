import { SyncExercisesToServerResponse } from "@/api/exercise.api";
import { ClientExercise, LocalExercise } from "@/types/models";

export const createMockExercise = (
  overrides?: Partial<LocalExercise>
): LocalExercise => ({
  id: Math.floor(Math.random() * 1000), // 임의의 ID
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
export const mockExerciseMemo = {
  content: "zz",
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
};

export const mockServerResponseExercises: ClientExercise[] = [
  {
    id: 101,
    name: "벤치프레스",
    category: "가슴",
    isCustom: false,
    isBookmarked: true,
    unit: "kg",
    exerciseMemo: mockExerciseMemo,
    createdAt: "2023-01-01T00:00:00Z",
    userId: null,
    imageUrl: "https://example.com/push-up.png",
  },
  {
    id: 102,
    name: "스쿼트",
    category: "하체",
    isCustom: false,
    isBookmarked: false,
    unit: "kg",
    exerciseMemo: null,
    createdAt: "2023-01-02T00:00:00Z",
    userId: null,
    imageUrl: "https://example.com/push-up.png",
  },
  {
    id: 103,
    name: "데드리프트",
    category: "하체",
    isCustom: false,
    isBookmarked: true,
    unit: "kg",
    exerciseMemo: mockExerciseMemo,
    createdAt: "2023-01-03T00:00:00Z",
    userId: null,
    imageUrl: "https://example.com/push-up.png",
  },
  {
    id: 104,
    name: "랫풀다운",
    category: "등",
    isCustom: false,
    isBookmarked: true,
    unit: "kg",
    exerciseMemo: mockExerciseMemo,
    createdAt: "2023-01-03T00:00:00Z",
    userId: null,
    imageUrl: "https://example.com/push-up.png",
  },
  {
    id: 105,
    name: "레그 익스텐션",
    category: "하체",
    isCustom: false,
    unit: "kg",
    exerciseMemo: mockExerciseMemo,
    isBookmarked: false,
    createdAt: "2023-01-03T00:00:00Z",
    userId: null,
    imageUrl: "https://example.com/push-up.png",
  },
];

export const mockLocalExercises: LocalExercise[] = [
  {
    category: "가슴",
    createdAt: "2023-01-01T00:00:00Z",
    id: 1,
    unit: "kg",
    imageUrl: "https://example.com/push-up.png",
    isBookmarked: true,
    isCustom: false,
    isSynced: false,
    name: "벤치프레스",
    exerciseMemo: mockExerciseMemo,
    serverId: null,
    updatedAt: null,
    userId: null,
  },
  {
    category: "하체",
    createdAt: "2023-01-02T00:00:00Z",
    id: 2,
    unit: "kg",
    imageUrl: "https://example.com/push-up.png",
    isBookmarked: false,
    isCustom: false,
    isSynced: true,
    name: "스쿼트",
    exerciseMemo: mockExerciseMemo,
    serverId: 102,
    updatedAt: null,
    userId: null,
  },
  {
    category: "하체",
    createdAt: "2023-01-03T00:00:00Z",
    id: 3,
    unit: "kg",
    imageUrl: "https://example.com/push-up.png",
    isBookmarked: true,
    isCustom: false,
    isSynced: false,
    name: "데드리프트",
    exerciseMemo: mockExerciseMemo,
    serverId: 103,
    updatedAt: null,
    userId: null,
  },
  {
    category: "등",
    createdAt: "2023-01-03T00:00:00Z",
    id: 4,
    unit: "kg",
    imageUrl: "https://example.com/push-up.png",
    isBookmarked: true,
    isCustom: false,
    isSynced: true,
    name: "랫풀다운",
    exerciseMemo: mockExerciseMemo,
    serverId: null,
    updatedAt: null,
    userId: null,
  },
];

export const mockFetchExercisesResponse = {
  success: true,
  exercises: mockServerResponseExercises,
};

export const mockInvalidFetchExercisesResponse = {
  success: "true",
  exercises: mockServerResponseExercises,
};

export const mockPostExercisesToServerResponse: SyncExercisesToServerResponse =
  {
    success: true,
    updated: [
      { localId: 1, serverId: 1 },
      { localId: 2, serverId: 2 },
      { localId: 3, serverId: 3 },
    ],
  };
export const mockInvalidPostExercisesToServerResponse = {
  success: true,
  updated: [
    { localId: 1, serverId: "1" },
    { localId: 2, serverId: 2 },
    { localId: 3, serverId: 3 },
  ],
};

export const createMockExercises = (
  overrides?: Partial<LocalExercise>
): LocalExercise[] => {
  return mockLocalExercises.map((ex) => ({ ...ex, ...overrides }));
};
