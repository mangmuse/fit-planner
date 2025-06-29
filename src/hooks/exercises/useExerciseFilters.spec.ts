import { mockExercise } from "@/__mocks__/exercise.mock";
import { getFilteredExercises } from "@/app/(main)/workout/[date]/exercises/_components/_utils/getFilteredExercises";
import useExerciseFilters from "@/hooks/exercises/useExerciseFilters";
import { act, renderHook, waitFor } from "@testing-library/react";

jest.mock(
  "@/app/(main)/workout/[date]/exercises/_components/_utils/getFilteredExercises"
);

const mockedGetFilteredExercises = getFilteredExercises as jest.Mock;

const mockExercises = mockExercise.list;

describe("useExerciseFilters", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetFilteredExercises.mockReturnValue(mockExercises);
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it("초기 렌더링 시, 모든 운동이 exercises를 visibleExercises로 반환한다", () => {
    const { result } = renderHook(() =>
      useExerciseFilters({ exercises: mockExercises })
    );

    expect(result.current.data.visibleExercises).toEqual(mockExercises);
  });

  it("getFilteredExercises의 값을 visibleExercises로 반환한다", () => {
    const { result } = renderHook(() =>
      useExerciseFilters({ exercises: mockExercises })
    );
    mockedGetFilteredExercises.mockReturnValue([]);
    act(() => {
      result.current.handlers.handleChangeSelectedCategory("등");
    });

    expect(result.current.data.visibleExercises).toEqual([]);
    expect(mockedGetFilteredExercises).toHaveBeenCalledTimes(2);
    expect(mockedGetFilteredExercises).toHaveBeenCalledWith(
      mockExercises,
      "",
      "전체",
      "등"
    );
  });

  it("카테고리 변경시 getFilteredExercises가 호출된다", () => {
    const { result } = renderHook(() =>
      useExerciseFilters({ exercises: mockExercises })
    );

    act(() => {
      result.current.handlers.handleChangeSelectedCategory("등");
    });

    expect(mockedGetFilteredExercises).toHaveBeenCalledWith(
      mockExercises,
      "",
      "전체",
      "등"
    );

    act(() => {
      result.current.handlers.handleChangeSelectedExerciseType("커스텀");
    });

    expect(mockedGetFilteredExercises).toHaveBeenCalledWith(
      mockExercises,
      "",
      "커스텀",
      "등"
    );
  });

  it("searchKeyword가 변경되면 500ms 후에 디바운스된 키워드로 필터링된다", () => {
    const { result } = renderHook(() =>
      useExerciseFilters({ exercises: mockExercises })
    );

    act(() => {
      result.current.handlers.handleSearchKeyword("프레스");
    });

    expect(mockedGetFilteredExercises).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockedGetFilteredExercises).toHaveBeenCalledWith(
      mockExercises,
      "프레스",
      "전체",
      "전체"
    );
  });

  it("여러 필터가 동시에 적용된경우 모든 필터를 반영하여 필터링된다.", async () => {
    const { result } = renderHook(() =>
      useExerciseFilters({ exercises: mockExercises })
    );

    act(() => {
      result.current.handlers.handleChangeSelectedCategory("가슴");
      result.current.handlers.handleChangeSelectedExerciseType("커스텀");
      result.current.handlers.handleSearchKeyword("프레스");
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockedGetFilteredExercises).toHaveBeenCalledWith(
      mockExercises,
      "프레스",
      "커스텀",
      "가슴"
    );
  });
});
