import { SyncExercisesToServerResponse } from "@/api/exercise.api";
import { ClientExercise, LocalExercise } from "@/types/models";

export const mockServerResponseExercises: ClientExercise[] = [
  {
    id: 1,
    name: "벤치프레스",
    category: "가슴",
    isCustom: false,
    isBookmarked: true,
    createdAt: "2023-01-01T00:00:00Z",
    userId: null,
    imageUrl: "/",
  },
  {
    id: 2,
    name: "스쿼트",
    category: "하체",
    isCustom: false,
    isBookmarked: false,
    createdAt: "2023-01-02T00:00:00Z",
    userId: null,
    imageUrl: "/",
  },
  {
    id: 3,
    name: "데드리프트",
    category: "하체",
    isCustom: false,
    isBookmarked: true,
    createdAt: "2023-01-03T00:00:00Z",
    userId: null,
    imageUrl: "/",
  },
  {
    id: 4,
    name: "랫풀다운",
    category: "등",
    isCustom: false,
    isBookmarked: true,
    createdAt: "2023-01-03T00:00:00Z",
    userId: null,
    imageUrl: "/",
  },
];

export const mockLocalExercises: LocalExercise[] = [
  {
    category: "가슴",
    createdAt: "2025-02-02T17:10:55.558Z",
    id: 1,
    imageUrl: "https://example.com/push-up.png",
    isBookmarked: false,
    isCustom: false,
    isSynced: false,
    name: "푸시업",
    serverId: null,
    updatedAt: null,
    userId: null,
  },
  {
    category: "하체",
    createdAt: "2025-02-02T17:10:55.558Z",
    id: 3,
    imageUrl: "https://example.com/push-up.png",
    isBookmarked: false,
    isCustom: false,
    isSynced: false,
    name: "스쿼트",
    serverId: null,
    updatedAt: null,
    userId: null,
  },
  {
    category: "등",
    createdAt: "2025-02-02T17:10:55.558Z",
    id: 2,
    imageUrl: "https://example.com/push-up.png",
    isBookmarked: false,
    isCustom: false,
    isSynced: false,
    name: "바벨로우",
    serverId: null,
    updatedAt: null,
    userId: null,
  },
];

export const mockPostExercisesToServerResponse: SyncExercisesToServerResponse =
  {
    success: true,
    updated: [
      { localId: 1, serverId: 1 },
      { localId: 2, serverId: 2 },
      { localId: 3, serverId: 3 },
    ],
  };
