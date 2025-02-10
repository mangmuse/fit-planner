import { mockExercises } from "@/__mocks__/api/handlers";
import { fetchExercisesFromServer } from "@/api/exercise.api";
import { BASE_URL } from "@/constants";
import { FETCH_EXERCISES_ERROR } from "@/constants/errorMessage";
import { server } from "jest.setup";
import { http } from "msw";

describe("fetchExercisesFromServer", () => {
  const targetUrl = `${BASE_URL}/api/exercises/all`;
  const userId = "test-user-123";
  it("올바른 api url로 fetch를 호출한다", async () => {
    let capturedUrl = "";
    server.use(
      http.get(targetUrl, ({ request }) => {
        capturedUrl = request.url;
        return new Response(JSON.stringify([]), { status: 200 });
      })
    );

    await fetchExercisesFromServer(userId);
    expect(capturedUrl).toBe(`${targetUrl}?userId=${userId}`);
  });

  it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
    server.use(
      http.get(targetUrl, () => {
        return new Response(JSON.stringify(mockExercises), { status: 200 });
      })
    );
    const result = await fetchExercisesFromServer(userId);
    expect(result).toEqual(mockExercises);
  });
  it("서버 응답이 실패할 경우 에러를 던진다", async () => {
    server.use(
      http.get(targetUrl, () => {
        return new Response(JSON.stringify({ success: false }), {
          status: 500,
        });
      })
    );

    await expect(fetchExercisesFromServer(userId)).rejects.toThrow(
      FETCH_EXERCISES_ERROR
    );
  });
});
