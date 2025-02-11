import { mockUserId } from "@/__mocks__/api";
import {
  mockLocalWorkouts,
  mockPostWorkoutsToServerResponse,
  mockServerWorkout,
} from "@/__mocks__/workout.mock";
import {
  fetchWorkoutFromServer,
  postWorkoutsToServer,
} from "@/api/workout.api";
import { BASE_URL } from "@/constants";
import {
  FETCH_WORKOUTS_ERROR,
  POST_WORKOUTS_ERROR,
} from "@/constants/errorMessage";
import { server } from "jest.setup";
import { http } from "msw";

const targetUrl = `${BASE_URL}/api/workout`;

describe("fetchWorkoutFromServer", () => {
  it("올바른 api url로 fetch를 호출한다", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${targetUrl}/${mockUserId}`, ({ request }) => {
        capturedUrl = request.url;
        return new Response(JSON.stringify([]), { status: 200 });
      })
    );
    await fetchWorkoutFromServer(mockUserId);
    expect(capturedUrl).toBe(`${targetUrl}/${mockUserId}`);
  });
  it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
    server.use(
      http.get(`${targetUrl}/${mockUserId}`, () => {
        return new Response(
          JSON.stringify({ success: true, workouts: mockServerWorkout }),
          { status: 200 }
        );
      })
    );
    const result = await fetchWorkoutFromServer(mockUserId);
    expect(result).toEqual(mockServerWorkout);
  });
  it("서버 응답이 실패할 경우 에러를 던진다", async () => {
    server.use(
      http.get(`${targetUrl}/${mockUserId}`, () => {
        return new Response(JSON.stringify({ success: false }), {
          status: 500,
        });
      })
    );

    await expect(fetchWorkoutFromServer(mockUserId)).rejects.toThrow(
      FETCH_WORKOUTS_ERROR
    );
  });
});

describe("postWorkoutsToServer", () => {
  it("올바른 api url로 fetch를 호출한다", async () => {
    let capturedUrl = "";
    server.use(
      http.post(`${targetUrl}/sync`, ({ request }) => {
        capturedUrl = request.url;
        return new Response(JSON.stringify([]), { status: 200 });
      })
    );
    await postWorkoutsToServer(mockLocalWorkouts);
    expect(capturedUrl).toBe(`${targetUrl}/sync`);
  });
  it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
    server.use(
      http.post(`${targetUrl}/sync`, () => {
        return new Response(JSON.stringify(mockPostWorkoutsToServerResponse), {
          status: 200,
        });
      })
    );
    const result = await postWorkoutsToServer(mockLocalWorkouts);
    expect(result).toEqual(mockPostWorkoutsToServerResponse);
  });
  it("서버 응답이 실패할 경우 에러를 던진다", async () => {
    server.use(
      http.post(`${targetUrl}/sync`, () => {
        return new Response(JSON.stringify({ success: false }), {
          status: 500,
        });
      })
    );

    await expect(postWorkoutsToServer(mockLocalWorkouts)).rejects.toThrow(
      POST_WORKOUTS_ERROR
    );
  });
});
