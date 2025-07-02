import { mockExercise } from "@/__mocks__/exercise.mock";
import { DailyMemoContentProps } from "@/app/(main)/_shared/session/exerciseMemo/DailyMemoContent";
import ExerciseMemo from "@/app/(main)/_shared/session/exerciseMemo/ExerciseMemo";
import { ExerciseMemoTabProps } from "@/app/(main)/_shared/session/exerciseMemo/ExerciseMemoTab";
import { FixedMemoContentProps } from "@/app/(main)/_shared/session/exerciseMemo/FixedMemoContent";
import { exerciseService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { LocalExercise } from "@/types/models";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

jest.mock("@/providers/contexts/ModalContext");
jest.mock("@/lib/di");

jest.mock("@/app/(main)/_shared/session/exerciseMemo/ExerciseMemoTab", () => ({
  __esModule: true,
  default: ({ activeTab, onSelect }: ExerciseMemoTabProps) => (
    <div data-testid="exercise-memo-tab">
      <button onClick={() => onSelect("fixed")}>고정 메모</button>
      <button onClick={() => onSelect("today")}>날짜별 메모</button>
      <span data-testid="active-tab">{activeTab}</span>
    </div>
  ),
}));

jest.mock("@/app/(main)/_shared/session/exerciseMemo/FixedMemoContent", () => ({
  __esModule: true,
  default: ({ onChange, memoText }: FixedMemoContentProps) => (
    <div data-testid="fixed-memo-content">
      <textarea
        value={memoText}
        onChange={(e) => onChange(e.target.value)}
        placeholder="메모를 입력하세요"
      />
    </div>
  ),
}));

jest.mock("@/app/(main)/_shared/session/exerciseMemo/DailyMemoContent", () => ({
  __esModule: true,
  default: ({ dailyMemos, loadExercises, exercise }: DailyMemoContentProps) => (
    <div data-testid="daily-memo-content">
      <div data-testid="daily-memos-count">{dailyMemos.length}</div>
      <div data-testid="exercise-id">{exercise.id}</div>
      <button onClick={loadExercises}>리로드</button>
    </div>
  ),
}));

const mockedUseModal = jest.mocked(useModal);
const mockedExerciseService = jest.mocked(exerciseService);

const mockDailyMemo: NonNullable<LocalExercise["exerciseMemo"]>["daily"] = [
  {
    date: "2025-01-01",
    content: "테스트 메모",
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: null,
  },
];

const mockExerciseWithFixedMemo: LocalExercise = {
  ...mockExercise.bookmarked,
  exerciseMemo: {
    fixed: {
      content: "고정 메모 내용",
      createdAt: new Date("2025-01-01").toISOString(),
      updatedAt: null,
    },
    daily: mockDailyMemo,
  },
  id: 500,
  name: "벤치 프레스",
};

const mockExerciseWithoutMemo: LocalExercise = {
  ...mockExercise.bookmarked,
  exerciseMemo: null,
  id: 501,
  name: "스쿼트",
};

describe("ExerciseMemo", () => {
  const mockCloseModal = jest.fn();
  const mockLoadExercises = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseModal.mockReturnValue({
      closeModal: mockCloseModal,
      openModal: jest.fn(),
      showError: jest.fn(),
      isOpen: false,
    });
    mockedExerciseService.updateLocalExercise.mockResolvedValue(500);
  });

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("렌더링", () => {
    it("운동 이름이 올바르게 표시된다", () => {
      render(
        <ExerciseMemo
          exercise={mockExerciseWithFixedMemo}
          loadExercises={mockLoadExercises}
        />
      );

      expect(screen.getByText("벤치 프레스")).toBeInTheDocument();
    });

    it("기본적으로 고정 메모 탭이 활성화되고 FixedMemoContent가 렌더링된다", () => {
      render(
        <ExerciseMemo
          exercise={mockExerciseWithFixedMemo}
          loadExercises={mockLoadExercises}
        />
      );

      expect(screen.getByTestId("active-tab")).toHaveTextContent("fixed");
      expect(screen.getByTestId("fixed-memo-content")).toBeInTheDocument();
      expect(
        screen.queryByTestId("daily-memo-content")
      ).not.toBeInTheDocument();
    });

    it("기존 고정 메모가 있으면 초기값으로 표시된다", () => {
      render(
        <ExerciseMemo
          exercise={mockExerciseWithFixedMemo}
          loadExercises={mockLoadExercises}
        />
      );

      const textarea = screen.getByPlaceholderText("메모를 입력하세요");
      expect(textarea).toHaveValue("고정 메모 내용");
    });

    it("메모가 없으면 빈 문자열로 초기화되고 확인 버튼이 비활성화된다", () => {
      render(
        <ExerciseMemo
          exercise={mockExerciseWithoutMemo}
          loadExercises={mockLoadExercises}
        />
      );

      const textarea = screen.getByPlaceholderText("메모를 입력하세요");
      expect(textarea).toHaveValue("");

      const confirmButton = screen.getByRole("button", { name: "확인" });
      expect(confirmButton).toBeDisabled();
    });
  });

  describe("탭 전환", () => {
    it("날짜별 메모 탭을 클릭하면 DailyMemoContent가 렌더링된다", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <ExerciseMemo
          exercise={mockExerciseWithFixedMemo}
          loadExercises={mockLoadExercises}
        />
      );

      await user.click(screen.getByText("날짜별 메모"));

      expect(screen.getByTestId("active-tab")).toHaveTextContent("today");
      expect(
        screen.queryByTestId("fixed-memo-content")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("daily-memo-content")).toBeInTheDocument();
    });

    it("날짜별 메모 탭에서는 확인 버튼이 항상 비활성화된다", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <ExerciseMemo
          exercise={mockExerciseWithFixedMemo}
          loadExercises={mockLoadExercises}
        />
      );

      await user.click(screen.getByText("날짜별 메모"));

      const confirmButton = screen.getByRole("button", { name: "확인" });
      expect(confirmButton).toBeDisabled();
    });

    it("DailyMemoContent에 올바른 props가 전달된다", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <ExerciseMemo
          exercise={mockExerciseWithFixedMemo}
          loadExercises={mockLoadExercises}
        />
      );

      await user.click(screen.getByText("날짜별 메모"));

      expect(screen.getByTestId("daily-memos-count")).toHaveTextContent("1");
      expect(screen.getByTestId("exercise-id")).toHaveTextContent("500");
    });
  });

  describe("고정 메모 수정", () => {
    it("텍스트를 입력하면 확인 버튼이 활성화된다", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <ExerciseMemo
          exercise={mockExerciseWithoutMemo}
          loadExercises={mockLoadExercises}
        />
      );

      const textarea = screen.getByPlaceholderText("메모를 입력하세요");
      const confirmButton = screen.getByRole("button", { name: "확인" });

      expect(confirmButton).toBeDisabled();

      await user.type(textarea, "새로운 메모");

      expect(confirmButton).toBeEnabled();
    });

    it("기존 메모가 있을 때는 확인 버튼이 활성화된다 (빈 값으로도 업데이트 가능)", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <ExerciseMemo
          exercise={mockExerciseWithFixedMemo}
          loadExercises={mockLoadExercises}
        />
      );

      const confirmButton = screen.getByRole("button", { name: "확인" });
      // 기존 메모가 있으면 항상 활성화 (빈 값으로도 업데이트 가능)
      expect(confirmButton).toBeEnabled();

      // 메모를 지워도 확인 버튼은 활성화 상태 유지
      const textarea = screen.getByPlaceholderText("메모를 입력하세요");
      await user.clear(textarea);

      expect(confirmButton).toBeEnabled();
    });

    it("확인 버튼을 클릭하면 updateLocalExercise가 올바른 데이터와 함께 호출된다", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <ExerciseMemo
          exercise={mockExerciseWithoutMemo}
          loadExercises={mockLoadExercises}
        />
      );

      const textarea = screen.getByPlaceholderText("메모를 입력하세요");
      await user.type(textarea, "새로운 메모");

      const confirmButton = screen.getByRole("button", { name: "확인" });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockedExerciseService.updateLocalExercise).toHaveBeenCalledWith({
          ...mockExerciseWithoutMemo,
          exerciseMemo: {
            fixed: {
              content: "새로운 메모",
              createdAt: "2025-01-10T12:00:00.000Z",
              updatedAt: null,
            },
            daily: [],
          },
        });
      });
    });

    it("기존 메모를 수정하면 updatedAt이 업데이트된다", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <ExerciseMemo
          exercise={mockExerciseWithFixedMemo}
          loadExercises={mockLoadExercises}
        />
      );

      const textarea = screen.getByPlaceholderText("메모를 입력하세요");
      await user.clear(textarea);
      await user.type(textarea, "수정된 메모");

      const confirmButton = screen.getByRole("button", { name: "확인" });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockedExerciseService.updateLocalExercise).toHaveBeenCalledWith({
          ...mockExerciseWithFixedMemo,
          exerciseMemo: {
            fixed: {
              content: "수정된 메모",
              createdAt: "2025-01-01T00:00:00.000Z",
              updatedAt: "2025-01-10T12:00:00.000Z",
            },
            daily: mockDailyMemo,
          },
        });
      });
    });

    it("저장 후 loadExercises와 closeModal이 순서대로 호출된다", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <ExerciseMemo
          exercise={mockExerciseWithoutMemo}
          loadExercises={mockLoadExercises}
        />
      );

      const textarea = screen.getByPlaceholderText("메모를 입력하세요");
      await user.type(textarea, "새로운 메모");

      const confirmButton = screen.getByRole("button", { name: "확인" });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockLoadExercises).toHaveBeenCalled();
        expect(mockCloseModal).toHaveBeenCalled();
      });

      // 호출 순서 확인
      const loadExercisesOrder = mockLoadExercises.mock.invocationCallOrder[0];
      const closeModalOrder = mockCloseModal.mock.invocationCallOrder[0];
      expect(loadExercisesOrder).toBeLessThan(closeModalOrder);
    });
  });

  describe("취소 버튼", () => {
    it("취소 버튼을 클릭하면 저장 없이 모달만 닫힌다", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <ExerciseMemo
          exercise={mockExerciseWithoutMemo}
          loadExercises={mockLoadExercises}
        />
      );

      const textarea = screen.getByPlaceholderText("메모를 입력하세요");
      await user.type(textarea, "저장하지 않을 메모");

      const cancelButton = screen.getByRole("button", { name: "취소" });
      await user.click(cancelButton);

      expect(mockCloseModal).toHaveBeenCalled();
      expect(mockedExerciseService.updateLocalExercise).not.toHaveBeenCalled();
      expect(mockLoadExercises).not.toHaveBeenCalled();
    });
  });
});
