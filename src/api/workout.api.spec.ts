import { mockUserId } from "@/__mocks__/api";
import {
  mockFetchWorkoutsResponse,
  mockInvalidFetchWorkoutsResponse,
  mockInvalidPostWorkoutsToServerResponse,
  mockLocalWorkouts,
  mockPostWorkoutsToServerResponse,
  mockServerWorkouts,
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
import { VALIDATION_FAILED } from "@/util/validateData";
import { server } from "jest.setup";
import { http } from "msw";

const targetUrl = `${BASE_URL}/api/workout`;

describe("fetchWorkoutFromServer", () => {
  it("올바른 api url로 fetch를 호출한다", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${targetUrl}/${mockUserId}`, ({ request }) => {
        capturedUrl = request.url;
        return new Response(JSON.stringify(mockFetchWorkoutsResponse), {
          status: 200,
        });
      })
    );
    await fetchWorkoutFromServer(mockUserId);
    expect(capturedUrl).toBe(`${targetUrl}/${mockUserId}`);
  });

  it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
    server.use(
      http.get(`${targetUrl}/${mockUserId}`, () => {
        return new Response(JSON.stringify(mockFetchWorkoutsResponse), {
          status: 200,
        });
      })
    );
    const result = await fetchWorkoutFromServer(mockUserId);
    expect(result).toEqual(mockServerWorkouts);
  });

  it("서버 응답이 기대한 값과 다를 경우 validation error를 던진다", async () => {
    server.use(
      http.get(`${targetUrl}/${mockUserId}`, () => {
        return new Response(JSON.stringify(mockInvalidFetchWorkoutsResponse), {
          status: 200,
        });
      })
    );

    await expect(fetchWorkoutFromServer(mockUserId)).rejects.toThrow(
      VALIDATION_FAILED
    );
  });

  it("서버 응답이 실패할 경우 에러를 던진다", async () => {
    server.use(
      http.get(`${targetUrl}/${mockUserId}`, () => {
        return new Response(
          JSON.stringify({ success: false, message: ";ㅅ;" }),
          {
            status: 500,
          }
        );
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
        return new Response(JSON.stringify(mockPostWorkoutsToServerResponse), {
          status: 200,
        });
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
  it("서버 응답이 기대한 값과 다를 경우 validation error를 던진다", async () => {
    server.use(
      http.post(`${targetUrl}/sync`, () => {
        return new Response(
          JSON.stringify(mockInvalidPostWorkoutsToServerResponse),
          {
            status: 200,
          }
        );
      })
    );

    await expect(postWorkoutsToServer(mockLocalWorkouts)).rejects.toThrow(
      VALIDATION_FAILED
    );
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
