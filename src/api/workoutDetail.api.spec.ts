import { mockLocalWorkoutDetails } from "./../__mocks__/workoutDetail.mock";
import { mockUserId } from "@/__mocks__/api";
import {
  mockPostWorkoutDetailsToServerResponse,
  mockServerWorkoutDetails,
} from "@/__mocks__/workoutDetail.mock";
import {
  fetchWorkoutDetailsFromServer,
  postWorkoutDetailsToServer,
} from "@/api/workoutDetail.api";
import { BASE_URL } from "@/constants";
import {
  FETCH_WORKOUT_DETAILS_ERROR,
  POST_WORKOUT_DETAILS_ERROR,
} from "@/constants/errorMessage";
import { server } from "jest.setup";
import { http } from "msw";

const targetUrl = `${BASE_URL}/api/workout/detail`;

describe("fetchWorkoutFromServer", () => {
  it("올바른 api url로 fetch를 호출한다", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${targetUrl}/${mockUserId}`, ({ request }) => {
        capturedUrl = request.url;
        return new Response(JSON.stringify([]), { status: 200 });
      })
    );
    await fetchWorkoutDetailsFromServer(mockUserId);
    expect(capturedUrl).toBe(`${targetUrl}/${mockUserId}`);
  });
  it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
    server.use(
      http.get(`${targetUrl}/${mockUserId}`, () => {
        return new Response(
          JSON.stringify({
            success: true,
            workoutDetails: mockServerWorkoutDetails,
          }),
          { status: 200 }
        );
      })
    );
    const result = await fetchWorkoutDetailsFromServer(mockUserId);
    expect(result).toEqual(mockServerWorkoutDetails);
  });
  it("서버 응답이 실패할 경우 에러를 던진다", async () => {
    server.use(
      http.get(`${targetUrl}/${mockUserId}`, () => {
        return new Response(JSON.stringify({ success: false }), {
          status: 500,
        });
      })
    );

    await expect(fetchWorkoutDetailsFromServer(mockUserId)).rejects.toThrow(
      FETCH_WORKOUT_DETAILS_ERROR
    );
  });
});

describe("postWorkoutDetailsToServer", () => {
  it("올바른 api url로 fetch를 호출한다", async () => {
    let capturedUrl = "";
    server.use(
      http.post(`${targetUrl}/sync`, ({ request }) => {
        capturedUrl = request.url;
        return new Response(JSON.stringify([]), { status: 200 });
      })
    );
    await postWorkoutDetailsToServer(mockLocalWorkoutDetails);
    expect(capturedUrl).toBe(`${targetUrl}/sync`);
  });
  it("서버 응답이 성공할 경우 예상된 데이터를 반환한다", async () => {
    server.use(
      http.post(`${targetUrl}/sync`, () => {
        return new Response(
          JSON.stringify(mockPostWorkoutDetailsToServerResponse),
          { status: 200 }
        );
      })
    );
    const result = await postWorkoutDetailsToServer(mockLocalWorkoutDetails);
    expect(result).toEqual(mockPostWorkoutDetailsToServerResponse);
  });
  it("서버 응답이 실패할 경우 에러를 던진다", async () => {
    server.use(
      http.post(`${targetUrl}/sync`, () => {
        return new Response(JSON.stringify({ success: false }), {
          status: 500,
        });
      })
    );

    await expect(
      postWorkoutDetailsToServer(mockLocalWorkoutDetails)
    ).rejects.toThrow(POST_WORKOUT_DETAILS_ERROR);
  });
});
