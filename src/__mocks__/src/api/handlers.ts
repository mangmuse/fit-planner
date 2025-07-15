import { BASE_URL } from "@/constants";
import { http, HttpResponse } from "msw";
import dayjs from "dayjs";
import {
  mockFetchExercisesResponse,
  mockpostExercisesResponse,
} from "@/__mocks__/exercise.mock";
import {
  FetchExercisesResponse,
  SyncExercisesToServerResponse,
} from "@/api/exercise.api";

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

export const handlers = [
  // ======== Exercise API ========

  http.get(`${BASE_URL}/api/exercises/all`, () => {
    const res: FetchExercisesResponse = mockFetchExercisesResponse;
    return HttpResponse.json(res, { status: 200 });
  }),

  http.post(`${BASE_URL}/api/exercises/sync`, () => {
    const res: SyncExercisesToServerResponse = mockpostExercisesResponse;
    return HttpResponse.json(res, { status: 201 });
  }),

  http.get(`/api/auth/session`, ({ request }) => {
    const isAuthenticated =
      request.headers.get("authorization") === "Bearer token";

    if (isAuthenticated) {
      return new Response(JSON.stringify(mockSession), { status: 200 });
    }

    return new Response(JSON.stringify({}), { status: 401 });
  }),
];
