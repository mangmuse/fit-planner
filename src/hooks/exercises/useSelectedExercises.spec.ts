import { mockExercise } from "@/__mocks__/exercise.mock";
import useSelectedExercises from "@/hooks/exercises/useSelectedExercises";
import { act, renderHook } from "@testing-library/react";

describe("useSelectedExercises", () => {
  const mockEx = mockExercise.bookmarked;
  const secondMockEx = mockExercise.synced;
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("차기 상태의 selectedExercises는 빈 배열이다", async () => {
    const { result } = renderHook(() =>
      useSelectedExercises({ allowMultipleSelection: true })
    );

    expect(result.current.selectedExercises).toEqual([]);
  });

  describe("단일 선택 모드", () => {
    it("운동을 선택하면 마지막에 선택한 운동으로 교체된다", () => {
      const { result } = renderHook(() =>
        useSelectedExercises({ allowMultipleSelection: false })
      );

      act(() => {
        result.current.handleSelectExercise(mockEx);
      });
      expect(result.current.selectedExercises).toEqual([
        { id: mockEx.id, name: mockEx.name },
      ]);

      act(() => {
        result.current.handleSelectExercise(secondMockEx);
      });

      expect(result.current.selectedExercises).toEqual([
        { id: secondMockEx.id, name: secondMockEx.name },
      ]);
    });
  });

  describe("다중 선택 모드", () => {
    it("운동을 선택하면 목록에 누적된다", () => {
      const { result } = renderHook(() =>
        useSelectedExercises({ allowMultipleSelection: true })
      );

      act(() => {
        result.current.handleSelectExercise(mockEx);
      });

      expect(result.current.selectedExercises).toEqual([
        { id: mockEx.id, name: mockEx.name },
      ]);

      act(() => {
        result.current.handleSelectExercise(secondMockEx);
      });

      expect(result.current.selectedExercises).toEqual([
        { id: mockEx.id, name: mockEx.name },
        { id: secondMockEx.id, name: secondMockEx.name },
      ]);
    });

    it("handleUnselectExercise를 호출하면 해당 운동만 목록에서 제거한다", () => {
      const { result } = renderHook(() =>
        useSelectedExercises({ allowMultipleSelection: true })
      );

      act(() => {
        result.current.handleSelectExercise(mockEx);
        result.current.handleSelectExercise(secondMockEx!);
      });

      expect(result.current.selectedExercises).toEqual([
        { id: mockEx.id, name: mockEx.name },
        { id: secondMockEx.id, name: secondMockEx.name },
      ]);

      act(() => {
        result.current.handleUnselectExercise(mockEx.id!);
      });

      expect(result.current.selectedExercises).toEqual([
        { id: secondMockEx.id, name: secondMockEx.name },
      ]);
    });

    it("중복된 운동을 선택하면 중복으로 추가되지 않는다", () => {
      const { result } = renderHook(() =>
        useSelectedExercises({ allowMultipleSelection: true })
      );

      act(() => {
        result.current.handleSelectExercise(mockEx);
        result.current.handleSelectExercise(mockEx);
      });

      expect(result.current.selectedExercises).toEqual([
        { id: mockEx.id, name: mockEx.name },
      ]);
    });
  });

  describe("edge cases", () => {
    it("id가 없는 운동을 선택하면 추가되지 않는다", () => {
      const { result } = renderHook(() =>
        useSelectedExercises({ allowMultipleSelection: true })
      );

      const exerciseWithoutId = { ...mockEx, id: undefined };

      act(() => {
        result.current.handleSelectExercise(exerciseWithoutId);
      });

      expect(result.current.selectedExercises).toEqual([]);
    });

    it("name이 없는 운동을 선택하면 추가되지 않는다", () => {
      const { result } = renderHook(() =>
        useSelectedExercises({ allowMultipleSelection: true })
      );

      const exerciseWithoutName = { ...mockEx, name: "" };

      act(() => {
        result.current.handleSelectExercise(exerciseWithoutName);
      });

      expect(result.current.selectedExercises).toEqual([]);
    });

    it("존재하지 않는 id로 운동을 제거하려고 하면 배열이 변경되지 않는다", () => {
      const { result } = renderHook(() =>
        useSelectedExercises({ allowMultipleSelection: true })
      );

      act(() => {
        result.current.handleSelectExercise(mockEx);
      });

      const originalArray = result.current.selectedExercises;

      act(() => {
        result.current.handleUnselectExercise(912399);
      });

      expect(result.current.selectedExercises).toEqual(originalArray);
    });
  });
});
