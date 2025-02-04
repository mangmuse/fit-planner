import { BASE_URL } from "@/constants";
import { ClientExerise } from "@/types/models";
import { http } from "msw";
import dayjs from "dayjs";
import { PatchBookmarkInput } from "@/types/dto/exercise.dto";

export const mockExercises: ClientExerise[] = [
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

const mockSession = {
  expires: dayjs().add(2, "day").toISOString(),
  user: {
    id: "e53d57ca-b8d4-45ca-b2f3-3fb8b19cfcdc",
    email: "mangmangmuse@gmail.com",
    name: "muse mang",
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocJ4pjHLq0-tllg2mv3WjpP_EbpCYn1sUzhG0UQ0ojGDJ9JGHA=s96-c",
  },
};

jest.mock("next-auth/react", () => {
  const originalModule = jest.requireActual("next-auth/react");

  return {
    __esModule: true, // ES 모듈 호환을 위함
    ...originalModule, // 기존 모듈의 내보내기를 보존하면서 리턴한다.
    useSession: jest.fn(() => {
      return { data: mockSession, status: "authenticated" };
    }),
  };
});

export const handlers = [
  http.get(`${BASE_URL}/api/exercises/all`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = decodeURIComponent(url.searchParams.get("keyword") || "");
    const category = decodeURIComponent(
      url.searchParams.get("category") || "전체"
    );
    const type = decodeURIComponent(url.searchParams.get("type") || "전체");

    const filtered = mockExercises.filter((exercise) => {
      const matchesKeyword = exercise.name
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const matchesCategory =
        category === "전체" || exercise.category === category;
      const matchesType =
        type === "전체"
          ? true
          : type === "커스텀"
          ? exercise.isCustom
          : type === "즐겨찾기"
          ? exercise.isBookmarked
          : true;

      return matchesKeyword && matchesCategory && matchesType;
    });

    return new Response(JSON.stringify(filtered), {
      status: 200,
    });
  }),

  http.patch(`${BASE_URL}/api/exercises/bookmark`, async ({ request }) => {
    const body = await request.json();

    const { userId, exerciseId } = body as PatchBookmarkInput;

    const exercise = mockExercises.find((e) => e.id === exerciseId);

    if (exercise) {
      exercise.isBookmarked = !exercise.isBookmarked;
    }

    return new Response(JSON.stringify(exercise), {
      status: 200,
    });
  }),

  http.post(`${BASE_URL}/api/workout/detail`, async () => {
    return new Response(JSON.stringify({ success: true }));
  }),

  http.get(`/api/auth/session`, ({ request }) => {
    const isAuthenticated =
      request.headers.get("authorization") === "Bearer token";

    // if (isAuthenticated) {
    return new Response(JSON.stringify(mockSession), { status: 200 });
    // }

    // return new Response(JSON.stringify({}), { status: 401 });
  }),
  // http.post(`${BASE_URL}/api/auth/_log`, ({ request }) => {
  //   return new Response(null, { status: 200 });
  // }),
];
