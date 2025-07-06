import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import ExercisesContainer from "./ExercisesContainer";
import {
  exerciseService,
  workoutDetailService,
  routineDetailService,
} from "@/lib/di";
import { LocalExercise, LocalWorkoutDetail, Saved } from "@/types/models";

jest.mock("next-auth/react");
jest.mock("@/lib/di");

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockExerciseService = exerciseService as jest.Mocked<
  typeof exerciseService
>;
const mockWorkoutDetailService = workoutDetailService as jest.Mocked<
  typeof workoutDetailService
>;
const mockRoutineDetailService = routineDetailService as jest.Mocked<
  typeof routineDetailService
>;

const mockCloseBottomSheet = jest.fn();
const mockShowError = jest.fn();
const mockOpenModal = jest.fn();

jest.mock("@/providers/contexts/BottomSheetContext", () => ({
  useBottomSheet: () => ({ closeBottomSheet: mockCloseBottomSheet }),
}));

jest.mock("@/providers/contexts/ModalContext", () => ({
  useModal: () => ({
    showError: mockShowError,
    openModal: mockOpenModal,
  }),
}));

const mockExercises: Saved<LocalExercise>[] = [
  {
    id: 1,
    name: "벤치프레스",
    category: "가슴",
    unit: "kg",
    isBookmarked: false,
    isCustom: false,
    isSynced: true,
    imageUrl: "https://example.com/bench-press.jpg",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: null,
    serverId: 1,
    userId: "user123",
    exerciseMemo: null,
  },
  {
    id: 2,
    name: "스쿼트",
    category: "하체",
    unit: "kg",
    isBookmarked: true,
    isCustom: false,
    isSynced: true,
    imageUrl: "https://example.com/squat.jpg",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: null,
    serverId: 2,
    userId: "user123",
    exerciseMemo: null,
  },
];

const mockCurrentDetails: Saved<LocalWorkoutDetail>[] = [
  {
    id: 1,
    serverId: "detail1",
    workoutId: 1,
    exerciseId: 1,
    exerciseName: "기존 운동",
    exerciseOrder: 1,
    setOrder: 1,
    weight: 100,
    reps: 10,
    rpe: null,
    isDone: false,
    isSynced: true,
    setType: "NORMAL",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: null,
  },
];

describe("Characterization Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSession.mockReturnValue({
      data: {
        user: { id: "user123" },
        expires: "2024-12-31T23:59:59.999Z",
      },
      status: "authenticated",
      update: jest.fn(),
    });

    mockExerciseService.getAllLocalExercises.mockResolvedValue(mockExercises);
    mockExerciseService.syncExercisesFromServerLocalFirst.mockResolvedValue();
    mockWorkoutDetailService.addLocalWorkoutDetailsByUserDate.mockResolvedValue(
      1
    );
    mockRoutineDetailService.getLocalRoutineDetails.mockResolvedValue([]);
    mockRoutineDetailService.addLocalRoutineDetailsByWorkoutId.mockResolvedValue();
  });

  describe("RECORD 타입 - 기본 사용 (추가 모드)", () => {
    beforeEach(() => {
      (useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
        date: "2024-01-01",
      });
    });

    it("초기 렌더링: 운동 목록이 올바르게 표시된다", async () => {
      render(<ExercisesContainer type="RECORD" allowMultipleSelection />);

      await waitFor(() => {
        expect(screen.getByText("벤치프레스")).toBeInTheDocument();
        expect(screen.getByText("스쿼트")).toBeInTheDocument();
      });

      expect(mockExerciseService.getAllLocalExercises).toHaveBeenCalled();
    });

    it("운동 선택 후 추가 버튼 클릭 시 올바른 서비스가 호출된다", async () => {
      render(<ExercisesContainer type="RECORD" allowMultipleSelection />);

      await waitFor(() => {
        expect(screen.getByText("벤치프레스")).toBeInTheDocument();
      });

      const exerciseElement = screen.getByText("벤치프레스").closest("li")!;
      fireEvent.click(exerciseElement);

      await waitFor(() => {
        const addButton = screen.getByText("1개 선택 완료");
        fireEvent.click(addButton);
      });

      expect(
        mockWorkoutDetailService.addLocalWorkoutDetailsByUserDate
      ).toHaveBeenCalledWith("user123", "2024-01-01", [
        { id: 1, name: "벤치프레스" },
      ]);
    });

    it("에러 발생 시 모달로 에러 메시지가 표시된다", async () => {
      mockWorkoutDetailService.addLocalWorkoutDetailsByUserDate.mockRejectedValue(
        new Error("Network Error")
      );

      render(<ExercisesContainer type="RECORD" allowMultipleSelection />);

      await waitFor(() => {
        expect(screen.getByText("벤치프레스")).toBeInTheDocument();
      });

      const exerciseElement = screen.getByText("벤치프레스").closest("li")!;
      fireEvent.click(exerciseElement);

      await waitFor(() => {
        const addButton = screen.getByText("1개 선택 완료");
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          "운동을 추가하는데 실패했습니다."
        );
      });
    });
  });

  describe("ROUTINE 타입 - 루틴 운동 추가", () => {
    beforeEach(() => {
      (useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
        routineId: "123",
      });
    });

    it("루틴 운동 추가 시 올바른 서비스가 호출된다", async () => {
      render(<ExercisesContainer type="ROUTINE" allowMultipleSelection />);

      await waitFor(() => {
        expect(screen.getByText("벤치프레스")).toBeInTheDocument();
      });

      const exerciseElement = screen.getByText("벤치프레스").closest("li")!;
      fireEvent.click(exerciseElement);

      await waitFor(() => {
        const addButton = screen.getByText("1개 선택 완료");
        fireEvent.click(addButton);
      });

      expect(
        mockRoutineDetailService.getLocalRoutineDetails
      ).toHaveBeenCalledWith(123);
      expect(
        mockRoutineDetailService.addLocalRoutineDetailsByWorkoutId
      ).toHaveBeenCalledWith(123, 1, [{ id: 1, name: "벤치프레스" }]);
    });
  });

  describe("교체 모드 (allowMultipleSelection=false, currentDetails 있음)", () => {
    const mockReloadDetails = jest.fn();

    beforeEach(() => {
      (useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
        date: "2024-01-01",
      });
    });

    it("교체하기 버튼이 표시되고 교체 로직이 동작한다", async () => {
      render(
        <ExercisesContainer
          type="RECORD"
          allowMultipleSelection={false}
          currentDetails={mockCurrentDetails}
          reloadDetails={mockReloadDetails}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("벤치프레스")).toBeInTheDocument();
      });

      const exerciseElement = screen.getByText("벤치프레스").closest("li")!;
      fireEvent.click(exerciseElement);

      await waitFor(() => {
        expect(screen.getByText("교체하기")).toBeInTheDocument();
      });

      const replaceButton = screen.getByText("교체하기");
      fireEvent.click(replaceButton);

      await waitFor(() => {
        expect(
          mockWorkoutDetailService.addLocalWorkoutDetailsByWorkoutId
        ).toHaveBeenCalled();
        expect(
          mockWorkoutDetailService.deleteWorkoutDetails
        ).toHaveBeenCalledWith(mockCurrentDetails);
        expect(mockReloadDetails).toHaveBeenCalled();
        expect(mockCloseBottomSheet).toHaveBeenCalled();
      });
    });
  });

  describe("검색 기능", () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ date: "2024-01-01" });
    });

    it("검색어 입력 시 필터링이 동작한다", async () => {
      render(<ExercisesContainer type="RECORD" allowMultipleSelection />);

      await waitFor(() => {
        expect(screen.getByText("벤치프레스")).toBeInTheDocument();
        expect(screen.getByText("스쿼트")).toBeInTheDocument();
      });

      const searchInput = screen.getByRole("textbox");
      fireEvent.change(searchInput, { target: { value: "벤치" } });

      // 디바운스 대기 후 필터링 확인
      await waitFor(
        () => {
          expect(screen.getByText("벤치프레스")).toBeInTheDocument();
          expect(screen.queryByText("스쿼트")).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe("커스텀 운동 추가", () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ date: "2024-01-01" });
    });

    it("추가 버튼 클릭 시 커스텀 운동 폼 모달이 열린다", async () => {
      render(<ExercisesContainer type="RECORD" allowMultipleSelection />);

      await waitFor(() => {
        expect(screen.getByText("벤치프레스")).toBeInTheDocument();
      });

      const addButton = screen.getByAltText("추가하기");
      fireEvent.click(addButton);

      expect(mockOpenModal).toHaveBeenCalledWith({
        type: "generic",
        children: expect.anything(),
      });
    });
  });

  describe("에러 상태", () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ date: "2024-01-01" });
    });

    it("운동 목록 로드 실패 시 ErrorState가 표시된다", async () => {
      mockExerciseService.getAllLocalExercises.mockRejectedValue(
        new Error("Network Error")
      );

      render(<ExercisesContainer type="RECORD" allowMultipleSelection />);

      await waitFor(() => {
        expect(
          screen.getByText("운동목록 초기화에 실패했습니다.")
        ).toBeInTheDocument();
      });
    });
  });
});
