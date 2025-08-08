jest.mock("@/lib/di");
jest.mock("dexie-react-hooks");

import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { IWorkoutService } from "./../types/services";
import { workoutService } from "@/lib/di";
import { mockWorkout } from "@/__mocks__/workout.mock";
import useLoadDetails from "@/hooks/useLoadDetails";
import { renderHook, waitFor } from "@testing-library/react";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import { useLiveQuery } from "dexie-react-hooks";

const mockWorkoutService =
  workoutService as unknown as jest.Mocked<IWorkoutService>;

const mockUseLiveQuery = useLiveQuery as jest.MockedFunction<
  typeof useLiveQuery
>;

const mockWorkoutDetails = [
  {
    ...mockWorkoutDetail.past,
    exerciseName: "벤치프레스",
    exerciseOrder: 1,
    setOrder: 2,
    id: 1,
  },
  {
    ...mockWorkoutDetail.past,
    exerciseName: "벤치프레스",
    exerciseOrder: 2,
    setOrder: 1,
    id: 2,
  },
  {
    ...mockWorkoutDetail.past,
    exerciseName: "벤치프레스",
    exerciseOrder: 1,
    setOrder: 1,
    id: 3,
  },
];

const mockRoutineDetails = [
  {
    ...mockRoutineDetail.past,
    exerciseName: "벤치프레스",
    exerciseOrder: 1,
    setOrder: 1,
    id: 1,
  },
  {
    ...mockRoutineDetail.past,
    exerciseName: "벤치프레스",
    exerciseOrder: 1,
    setOrder: 2,
    id: 2,
  },
  {
    ...mockRoutineDetail.past,
    exerciseName: "벤치프레스",
    exerciseOrder: 2,
    setOrder: 1,
    id: 3,
  },
];
const mockW = mockWorkout.planned;

describe("useLoadDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("type이 RECORD일 때, 운동 세부 정보를 올바르게 그루핑하여 반환한다", async () => {
    mockWorkoutService.getWorkoutByUserIdAndDate.mockResolvedValue(mockW);
    mockWorkoutService.updateLocalWorkout.mockResolvedValue();

    mockUseLiveQuery.mockImplementation((_queryFn, deps) => {
      if (deps && deps[0] === "RECORD") {
        return { data: mockWorkoutDetails, error: null };
      }
      return { data: [], error: null };
    });

    const { result } = renderHook(() =>
      useLoadDetails({
        type: "RECORD",
        userId: "1",
        date: "2025-06-29",
      })
    );
    const expectedGroups = getGroupedDetails(mockWorkoutDetails);
    await waitFor(() => {
      expect(result.current.workout).toEqual(mockW);
      expect(result.current.workoutGroups).toEqual(expectedGroups);
      expect(
        result.current.workoutGroups[0].details.map((d: { id: number }) => d.id)
      ).toEqual([3, 1]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  it("type이 ROUTINE일 때, 운동 세부 정보를 올바르게 그루핑하여 반환한다", async () => {
    mockUseLiveQuery.mockImplementation((_queryFn, deps) => {
      if (deps && deps[0] === "ROUTINE") {
        return { data: mockRoutineDetails, error: null };
      }
      return { data: [], error: null };
    });

    const { result } = renderHook(() =>
      useLoadDetails({
        type: "ROUTINE",
        userId: "1",
        date: "2025-06-29",
        routineId: 1,
      })
    );
    const expectedGroups = getGroupedDetails(mockRoutineDetails);
    await waitFor(() => {
      expect(result.current.workout).toBeNull();
      expect(result.current.workoutGroups).toEqual(expectedGroups);
      expect(
        result.current.workoutGroups[0].details.map((d: { id: number }) => d.id)
      ).toEqual([1, 2]);
    });
  });

  it("초기 렌더링 시, 로딩 상태가 true에서 false로 변경된다", async () => {
    mockWorkoutService.getWorkoutByUserIdAndDate.mockResolvedValue(mockW);

    mockUseLiveQuery.mockImplementation((_queryFn, deps) => {
      if (deps && deps[0] === "RECORD") {
        return { data: mockWorkoutDetails, error: null };
      }
      return { data: [], error: null };
    });

    const { result } = renderHook(() =>
      useLoadDetails({
        type: "RECORD",
        userId: "1",
        date: "2025-06-29",
      })
    );
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("데이터 로딩에 실패하면, 에러를 설정하고 로딩 상태를 false로 변경한다", async () => {
    const mockError = new Error("데이터 로딩 실패");
    mockWorkoutService.getWorkoutByUserIdAndDate.mockResolvedValue(mockW);

    mockUseLiveQuery.mockImplementation((_queryFn, deps) => {
      if (deps && deps[0] === "RECORD") {
        return { data: [], error: mockError };
      }
      return { data: [], error: null };
    });

    const { result } = renderHook(() =>
      useLoadDetails({
        type: "RECORD",
        userId: "1",
        date: "2025-06-29",
      })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("운동 정보를 불러오는데 실패했습니다");
    });
  });
  it("상태 동기화에 실패하면, 에러를 설정하고 로딩 상태를 false로 변경한다", async () => {
    mockWorkoutService.getWorkoutByUserIdAndDate.mockResolvedValue(mockW);
    mockWorkoutService.updateLocalWorkout.mockRejectedValue(
      new Error("상태 동기화 실패")
    );

    mockUseLiveQuery.mockImplementation((_queryFn, deps) => {
      if (deps && deps[0] === "RECORD") {
        return { data: mockWorkoutDetails, error: null };
      }
      return { data: [], error: null };
    });

    const { result } = renderHook(() =>
      useLoadDetails({
        type: "RECORD",
        userId: "1",
        date: "2025-06-29",
      })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(
        "운동 상태를 동기화하는데 실패했습니다"
      );
    });
  });
});
