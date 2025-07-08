jest.mock("@/lib/di");
import { exerciseService } from "@/lib/di";
import useExercises from "@/hooks/exercises/useExercises";
import { renderHook, waitFor } from "@testing-library/react";
import { IExerciseService } from "@/types/services";
import { mockExercise } from "@/__mocks__/exercise.mock";

const mockExerciseService =
  exerciseService as unknown as jest.Mocked<IExerciseService>;

const mockExercises = mockExercise.list;

describe("useExercises", () => {
  const mockUserId = "user-123";
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exercises 목록을 올바르게 반환한다", async () => {
    mockExerciseService.getAllLocalExercises.mockResolvedValue(mockExercises);

    const { result } = renderHook(() => useExercises({ userId: mockUserId }));

    await waitFor(() => {
      expect(result.current.exercises).toEqual(mockExercises);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  it("로컬DB에 운동 목록이 없으면, 서버에서 운동 목록을 불러온다", async () => {
    mockExerciseService.syncFromServerIfNeeded.mockResolvedValue(undefined);
    mockExerciseService.getAllLocalExercises.mockResolvedValue(mockExercises);

    const { result } = renderHook(() => useExercises({ userId: mockUserId }));

    await waitFor(() => {
      expect(result.current.exercises).toEqual(mockExercises);
      expect(exerciseService.syncFromServerIfNeeded).toHaveBeenCalledWith(
        mockUserId
      );
    });
  });

  it("초기 렌더링 시, 로딩 상태가 true에서 false로 변경된다", async () => {
    mockExerciseService.getAllLocalExercises.mockResolvedValue([]);

    const { result } = renderHook(() => useExercises({ userId: mockUserId }));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("운동목록 로딩에 실패하면 에러를 설정하고 로딩 상태를 false로 변경한다", async () => {
    const mockError = new Error("데이터 로딩 실패");
    mockExerciseService.getAllLocalExercises.mockRejectedValue(mockError);

    const { result } = renderHook(() => useExercises({ userId: mockUserId }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("운동목록 초기화에 실패했습니다.");
    });
  });
  it("서버 동기화에 실패하면 에러를 설정하고 로딩 상태를 false로 변경한다", async () => {
    mockExerciseService.getAllLocalExercises.mockResolvedValue([]);
    mockExerciseService.syncFromServerIfNeeded.mockRejectedValue(
      new Error("서버 동기화 실패")
    );

    const { result } = renderHook(() => useExercises({ userId: mockUserId }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("운동목록 초기화에 실패했습니다.");
    });
  });
});
