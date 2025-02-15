import { BASE_URL } from "@/constants";
import { http } from "msw";
import dayjs from "dayjs";
import { PatchBookmarkInput } from "@/types/dto/exercise.dto";
import { mockServerResponseExercises } from "@/__mocks__/exercise.mock";

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
  http.patch(`${BASE_URL}/api/exercises/bookmark`, async ({ request }) => {
    const body = await request.json();

    const { userId, exerciseId } = body as PatchBookmarkInput;

    const exercise = mockServerResponseExercises.find(
      (e) => e.id === exerciseId
    );

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
