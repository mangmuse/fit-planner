import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorkoutContainer from "./WorkoutContainer";
import { LocalWorkout, LocalWorkoutDetail } from "@/types/models";
import { mockWorkout as workoutMockData } from "@/__mocks__/workout.mock";
import { mockWorkoutDetail as workoutDetailMockData } from "@/__mocks__/workoutDetail.mock";
import {
  workoutService,
  workoutDetailService,
  routineDetailService,
} from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";

jest.mock("@/lib/di", () => ({
  workoutService: {
    getWorkoutByUserIdAndDate: jest.fn(),
    updateLocalWorkout: jest.fn(),
    deleteLocalWorkout: jest.fn(),
  },
  workoutDetailService: {
    getLocalWorkoutDetails: jest.fn(),
    updateLocalWorkoutDetail: jest.fn(),
    deleteWorkoutDetails: jest.fn(),
  },
  routineService: {
    deleteLocalRoutine: jest.fn(),
  },
  routineDetailService: {
    getLocalRoutineDetails: jest.fn(),
    updateLocalRoutineDetail: jest.fn(),
    deleteRoutineDetails: jest.fn(),
  },
}));

jest.mock("@/providers/contexts/ModalContext");
jest.mock("@/providers/contexts/BottomSheetContext");
jest.mock("@/app/(main)/workout/_components/WorkoutExerciseGroup", () => {
  return function MockWorkoutExerciseGroup({
    details,
  }: {
    details: LocalWorkoutDetail[];
  }) {
    return (
      <div data-testid="workout-exercise-group">{details[0]?.exerciseName}</div>
    );
  };
});

jest.mock("@/app/(main)/workout/_components/WorkoutPlaceholder", () => {
  return function MockWorkoutPlaceholder() {
    return <div data-testid="workout-placeholder">Placeholder</div>;
  };
});

jest.mock("@/app/(main)/workout/_components/LoadPastWorkoutSheet", () => {
  return function MockLoadPastWorkoutSheet() {
    return <div data-testid="load-past-workout-sheet">Load Past Workout</div>;
  };
});

jest.mock("@/app/(main)/workout/_components/WorkoutSequence", () => {
  return function MockWorkoutSequence() {
    return <div data-testid="workout-sequence">Workout Sequence</div>;
  };
});

jest.mock("@/components/ErrorState", () => {
  return function MockErrorState({
    error,
    onRetry,
  }: {
    error: string;
    onRetry: () => void;
  }) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={onRetry}>다시 시도</button>
      </div>
    );
  };
});

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/workout/2024-01-01",
}));

const mockWorkoutDetails: LocalWorkoutDetail[] = [
  workoutDetailMockData.new({
    id: 1,
    exerciseName: "벤치프레스",
    exerciseOrder: 1,
    setOrder: 1,
    weight: 100,
    reps: 10,
  }),
  workoutDetailMockData.new({
    id: 2,
    exerciseName: "벤치프레스",
    exerciseOrder: 1,
    setOrder: 2,
    weight: 105,
    reps: 8,
  }),
];

const mockWorkout: LocalWorkout = workoutMockData.planned;

describe("WorkoutContainer - 규정 테스트", () => {
  const mockOpenModal = jest.fn();
  const mockOpenBottomSheet = jest.fn();
  const mockCloseBottomSheet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();

    (useModal as jest.Mock).mockReturnValue({
      openModal: mockOpenModal,
      isOpen: false,
    });

    (useBottomSheet as jest.Mock).mockReturnValue({
      openBottomSheet: mockOpenBottomSheet,
      closeBottomSheet: mockCloseBottomSheet,
      isOpen: false,
    });

    (workoutService.getWorkoutByUserIdAndDate as jest.Mock).mockResolvedValue(
      mockWorkout
    );
    (
      workoutDetailService.getLocalWorkoutDetails as jest.Mock
    ).mockResolvedValue(mockWorkoutDetails);
    (
      routineDetailService.getLocalRoutineDetails as jest.Mock
    ).mockResolvedValue([]);
  });

  describe("RECORD 타입 렌더링", () => {
    it("운동 데이터가 있을 때 모든 UI 요소가 표시된다", async () => {
      render(
        <WorkoutContainer
          type="RECORD"
          date="2024-01-01"
          formattedDate="2024년 1월 1일"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("2024년 1월 1일")).toBeInTheDocument();
      });

      expect(screen.getByAltText("전체 삭제")).toBeInTheDocument();
      expect(screen.getByAltText("순서 변경")).toBeInTheDocument();
      expect(screen.getByText("운동 추가")).toBeInTheDocument();
      expect(screen.getByText("불러오기")).toBeInTheDocument();
      expect(screen.getByText("운동 완료")).toBeInTheDocument();
      expect(screen.getByTestId("workout-exercise-group")).toBeInTheDocument();
    });

    it("운동 데이터가 없을 때 Placeholder가 표시된다", async () => {
      (
        workoutDetailService.getLocalWorkoutDetails as jest.Mock
      ).mockResolvedValue([]);

      render(
        <WorkoutContainer
          type="RECORD"
          date="2024-01-01"
          formattedDate="2024년 1월 1일"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("workout-placeholder")).toBeInTheDocument();
      });

      expect(screen.queryByText("운동 추가")).not.toBeInTheDocument();
      expect(screen.queryByText("운동 완료")).not.toBeInTheDocument();
    });

    it("완료된 운동은 운동 완료 버튼이 표시되지 않는다", async () => {
      const completedWorkout = { ...mockWorkout, status: "COMPLETED" as const };
      (workoutService.getWorkoutByUserIdAndDate as jest.Mock).mockResolvedValue(
        completedWorkout
      );

      render(
        <WorkoutContainer
          type="RECORD"
          date="2024-01-01"
          formattedDate="2024년 1월 1일"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("2024년 1월 1일")).toBeInTheDocument();
      });

      expect(screen.queryByText("운동 완료")).not.toBeInTheDocument();
    });
  });

  describe("ROUTINE 타입 렌더링", () => {
    it("루틴 모드에서는 운동 완료 버튼이 없다", async () => {
      (
        routineDetailService.getLocalRoutineDetails as jest.Mock
      ).mockResolvedValue(mockWorkoutDetails);

      render(<WorkoutContainer type="ROUTINE" routineId={123} />);

      await waitFor(() => {
        expect(screen.getByText("운동 추가")).toBeInTheDocument();
      });

      expect(screen.queryByText("운동 완료")).not.toBeInTheDocument();
    });
  });

  describe("사용자 인터랙션", () => {
    it("전체 삭제 버튼 클릭 시 확인 모달이 열린다", async () => {
      const user = userEvent.setup();

      render(
        <WorkoutContainer
          type="RECORD"
          date="2024-01-01"
          formattedDate="2024년 1월 1일"
        />
      );

      await waitFor(() => {
        expect(screen.getByAltText("전체 삭제")).toBeInTheDocument();
      });

      await user.click(screen.getByAltText("전체 삭제"));

      expect(mockOpenModal).toHaveBeenCalledWith({
        type: "confirm",
        title: "운동 전체 삭제",
        message: "모든 운동을 삭제하시겠습니까?",
        onConfirm: expect.any(Function),
      });
    });

    it("순서 변경 버튼 클릭 시 BottomSheet가 열린다", async () => {
      const user = userEvent.setup();

      render(
        <WorkoutContainer
          type="RECORD"
          date="2024-01-01"
          formattedDate="2024년 1월 1일"
        />
      );

      await waitFor(() => {
        expect(screen.getByAltText("순서 변경")).toBeInTheDocument();
      });

      await user.click(screen.getByAltText("순서 변경"));

      expect(mockOpenBottomSheet).toHaveBeenCalledWith({
        height: "100dvh",
        children: expect.anything(),
      });
    });

    it("불러오기 버튼 클릭 시 BottomSheet가 열린다", async () => {
      const user = userEvent.setup();

      render(
        <WorkoutContainer
          type="RECORD"
          date="2024-01-01"
          formattedDate="2024년 1월 1일"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("불러오기")).toBeInTheDocument();
      });

      await user.click(screen.getByText("불러오기"));

      expect(mockOpenBottomSheet).toHaveBeenCalledWith({
        height: "100dvh",
        rounded: false,
        children: expect.anything(),
      });
    });

    it("운동 완료 버튼 클릭 시 확인 모달이 열린다", async () => {
      const user = userEvent.setup();

      render(
        <WorkoutContainer
          type="RECORD"
          date="2024-01-01"
          formattedDate="2024년 1월 1일"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("운동 완료")).toBeInTheDocument();
      });

      await user.click(screen.getByText("운동 완료"));

      expect(mockOpenModal).toHaveBeenCalledWith({
        type: "confirm",
        title: "운동 완료",
        message: "운동을 완료하시겠습니까?",
        onConfirm: expect.any(Function),
      });
    });
  });

  describe("에러 처리", () => {
    it("데이터 로드 실패 시 에러 상태가 표시된다", async () => {
      (
        workoutDetailService.getLocalWorkoutDetails as jest.Mock
      ).mockRejectedValue(new Error("Failed to load"));

      render(
        <WorkoutContainer
          type="RECORD"
          date="2024-01-01"
          formattedDate="2024년 1월 1일"
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText("운동 세부 정보를 불러오는데 실패했습니다")
        ).toBeInTheDocument();
      });

      expect(screen.getByText("다시 시도")).toBeInTheDocument();
    });
  });

  describe("로딩 상태", () => {
    it("데이터 로드 중 로딩 표시가 나타난다", () => {
      render(
        <WorkoutContainer
          type="RECORD"
          date="2024-01-01"
          formattedDate="2024년 1월 1일"
        />
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("날짜 표시", () => {
    it("formattedDate가 문자열일 때 time 태그로 렌더링된다", async () => {
      render(
        <WorkoutContainer
          type="RECORD"
          date="2024-01-01"
          formattedDate="2024년 1월 1일"
        />
      );

      await waitFor(() => {
        const timeElement = screen.getByText("2024년 1월 1일");
        expect(timeElement.tagName).toBe("TIME");
      });
    });

    it("formattedDate가 React 엘리먼트일 때 div로 렌더링된다", async () => {
      const CustomDate = <span>커스텀 날짜</span>;

      render(
        <WorkoutContainer
          type="RECORD"
          date="2024-01-01"
          formattedDate={CustomDate}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("커스텀 날짜")).toBeInTheDocument();
      });
    });
  });
});
