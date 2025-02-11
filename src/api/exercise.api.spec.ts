import { mockUserId } from "@/__mocks__/api";
import {
  mockLocalExercises,
  mockServerResponseExercises,
  mockPostExercisesToServerResponse,
} from "@/__mocks__/exercise.mock";
import {
  fetchExercisesFromServer,
  postExercisesToServer,
} from "@/api/exercise.api";
import { BASE_URL } from "@/constants";
import {
  FETCH_EXERCISES_ERROR,
  POST_EXERCISES_ERROR,
} from "@/constants/errorMessage";
import { server } from "jest.setup";
import { http } from "msw";

describe("fetchExercisesFromServer", () => {
  const targetUrl = `${BASE_URL}/api/exercises/all`;
  it("올바른 api url로 fetch를 호출한다", async () => {
    let capturedUrl = "";
    server.use(
      http.get(targetUrl, ({ request }) => {
        capturedUrl = request.url;
        return new Response(JSON.stringify([]), { status: 200 });
      })
    );

    await fetchExercisesFromServer(mockUserId);
    expect(capturedUrl).toBe(`${targetUrl}?userId=${mockUserId}`);
  });

  it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
    server.use(
      http.get(targetUrl, () => {
        return new Response(JSON.stringify(mockServerResponseExercises), {
          status: 200,
        });
      })
    );
    const result = await fetchExercisesFromServer(mockUserId);
    expect(result).toEqual(mockServerResponseExercises);
  });
  it("서버 응답이 실패할 경우 에러를 던진다", async () => {
    server.use(
      http.get(targetUrl, () => {
        return new Response(JSON.stringify({ success: false }), {
          status: 500,
        });
      })
    );

    await expect(fetchExercisesFromServer(mockUserId)).rejects.toThrow(
      FETCH_EXERCISES_ERROR
    );
  });
});

describe("postExercisesToServer", () => {
  const targetUrl = `${BASE_URL}/api/exercises/sync`;
  it("올바른 api url로 fetch를 호출한다", async () => {
    let capturedUrl = "";
    server.use(
      http.post(targetUrl, ({ request }) => {
        capturedUrl = request.url;
        return new Response(JSON.stringify([]), { status: 200 });
      })
    );

    await postExercisesToServer(mockLocalExercises, mockUserId);
    expect(capturedUrl).toBe(targetUrl);
  });
  it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
    server.use(
      http.post(targetUrl, () => {
        return new Response(JSON.stringify(mockPostExercisesToServerResponse), {
          status: 200,
        });
      })
    );
    const result = await postExercisesToServer(mockLocalExercises, mockUserId);
    console.log(result);
    expect(result).toEqual(mockPostExercisesToServerResponse);
  });
  it("서버 응답이 실패할 경우 에러를 던진다", async () => {
    server.use(
      http.post(targetUrl, () => {
        return new Response(JSON.stringify({ success: false }), {
          status: 500,
        });
      })
    );

    await expect(
      postExercisesToServer(mockLocalExercises, mockUserId)
    ).rejects.toThrow(POST_EXERCISES_ERROR);
  });
});
