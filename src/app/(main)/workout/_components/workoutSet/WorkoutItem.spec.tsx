jest.mock("@/providers/contexts/ModalContext");
jest.mock("@/lib/di");

import { mockExercise } from "@/__mocks__/exercise.mock";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import WorkoutItem, {
  WorkoutItemProps,
} from "@/app/(main)/workout/_components/workoutSet/WorkoutItem";
import { routineDetailService, workoutDetailService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUseModal = jest.mocked(useModal);
const mockWorkoutDetailService = jest.mocked(workoutDetailService);
const mockRoutineDetailService = jest.mocked(routineDetailService);

describe("WorkoutItem", () => {
  const mockShowError = jest.fn();
  const mockReload = jest.fn();
  const mockReorder = jest.fn();

  const mockWD = mockWorkoutDetail.past;
  const mockRD = mockRoutineDetail.past;
  const mockEx = mockExercise.bookmarked;
  const mockPrevWD = { ...mockWorkoutDetail.past, weight: 100, reps: 10 };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseModal.mockReturnValue({
      showError: mockShowError,
      openModal: jest.fn(),
      closeModal: jest.fn(),
      isOpen: false,
    });
  });

  const renderWorkoutItem = (props?: Partial<WorkoutItemProps>) => {
    const defaultProps: WorkoutItemProps = {
      exercise: mockEx,
      detail: mockWD,
      prevWorkoutDetail: mockPrevWD,
      reorderAfterDelete: mockReorder,
      reload: mockReload,
    };

    render(<WorkoutItem {...defaultProps} {...props} />);
  };

  describe("렌더링", () => {
    it("detail이 전달되면 전달받은 값이 표시된다", () => {
      renderWorkoutItem();

      const setOrder = screen.getByTestId("set-order");
      expect(setOrder).toHaveTextContent(mockWD.setOrder.toString());

      const weight = screen.getByTestId("weight");
      expect(weight).toHaveValue(mockWD.weight?.toString() ?? "");

      const reps = screen.getByTestId("reps");
      expect(reps).toHaveValue(mockWD.reps?.toString() ?? "");

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("prevWorkoutDetail이 전달되면 전달받은 값이 표시된다", () => {
      renderWorkoutItem({ prevWorkoutDetail: mockPrevWD });

      const prevRecord = screen.getByTestId("prev-record");

      expect(prevRecord).toHaveTextContent(
        `${mockPrevWD.weight} ${mockEx.unit || "kg"} x ${mockPrevWD.reps} 회`
      );
    });
  });

  it("detail이 workoutDetail일 경우 체크박스가 표시된다", () => {
    renderWorkoutItem();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();

    const deleteButton = screen.queryByRole("button");
    expect(deleteButton).not.toBeInTheDocument();
  });

  it("detail이 routineDetail일 경우 삭제 버튼이 표시된다", () => {
    renderWorkoutItem({ detail: mockRD });

    const deleteButton = screen.getByRole("button");
    expect(deleteButton).toBeInTheDocument();

    const checkbox = screen.queryByRole("checkbox");
    expect(checkbox).not.toBeInTheDocument();
  });

  describe("상호작용", () => {
    const user = userEvent.setup();
    it("weight 입력후 포커스가 해제되면 입력값을 업데이트한다", async () => {
      renderWorkoutItem();

      const weight = screen.getByTestId("weight");

      await user.clear(weight);
      await user.type(weight, "567");
      await user.tab();

      expect(
        mockWorkoutDetailService.updateLocalWorkoutDetail
      ).toHaveBeenCalledWith({
        weight: 567,
        id: mockWD.id,
      });

      expect(mockReload).toHaveBeenCalledTimes(1);

      // RoutineDetail 관련 메서드는 호출되지 않음
      expect(
        mockRoutineDetailService.updateLocalRoutineDetail
      ).not.toHaveBeenCalled();
    });

    it("reps 입력후 포커스가 해제되면 입력값을 업데이트한다", async () => {
      renderWorkoutItem({ detail: mockRD });

      const reps = screen.getByTestId("reps");

      await user.clear(reps);
      await user.type(reps, "10");
      await user.tab();

      expect(
        mockRoutineDetailService.updateLocalRoutineDetail
      ).toHaveBeenCalledWith({
        reps: 10,
        id: mockWD.id,
      });

      expect(mockReload).toHaveBeenCalledTimes(1);

      // WorkoutDetail 관련 메서드는 호출되지 않음
      expect(
        mockWorkoutDetailService.updateLocalWorkoutDetail
      ).not.toHaveBeenCalled();
    });

    it("weight 값이 변경되지 않으면 업데이트 하지 않는다", async () => {
      renderWorkoutItem({ detail: { ...mockWD, weight: 100 } });

      const weight = screen.getByTestId("weight");
      await user.clear(weight);
      await user.type(weight, "100");
      await user.tab();

      expect(
        mockWorkoutDetailService.updateLocalWorkoutDetail
      ).not.toHaveBeenCalled();
    });

    it("루틴의 경우 삭제 버튼을 클릭하면 루틴 상세 삭제 후 재정렬 후 리로드한다", async () => {
      renderWorkoutItem({ detail: mockRD });

      const deleteButton = screen.getByRole("button", { name: "delete" });
      await user.click(deleteButton);

      expect(mockRoutineDetailService.deleteRoutineDetail).toHaveBeenCalledWith(
        mockRD.id
      );
      expect(mockReorder).toHaveBeenCalledWith(mockRD.exerciseOrder);
      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it("무게나 횟수 업데이트 도중 에러가 발생하면 에러 모달을 표시한다 (workoutDetail)", async () => {
      mockWorkoutDetailService.updateLocalWorkoutDetail.mockRejectedValue(
        new Error("업데이트 실패")
      );

      renderWorkoutItem();

      const weight = screen.getByTestId("weight");
      await user.clear(weight);
      await user.type(weight, "567");
      await user.tab();

      expect(mockShowError).toHaveBeenCalledWith(
        "운동 상태 업데이트에 실패했습니다"
      );
    });

    it("무게나 횟수 업데이트 도중 에러가 발생하면 에러 모달을 표시한다 (routineDetail)", async () => {
      mockRoutineDetailService.updateLocalRoutineDetail.mockRejectedValue(
        new Error("업데이트 실패")
      );

      renderWorkoutItem({ detail: mockRD });

      const weight = screen.getByTestId("weight");
      await user.clear(weight);
      await user.type(weight, "567");
      await user.tab();

      expect(mockShowError).toHaveBeenCalledWith(
        "운동 상태 업데이트에 실패했습니다"
      );
    });

    it("삭제 처리 도중 에러가 발생하면 에러 모달을 표시한다", async () => {
      renderWorkoutItem({ detail: mockRD });

      mockRoutineDetailService.deleteRoutineDetail.mockRejectedValue(
        new Error("못지움")
      );

      const deleteButton = screen.getByRole("button", { name: "delete" });
      await user.click(deleteButton);

      expect(mockShowError).toHaveBeenCalledWith("운동 삭제에 실패했습니다");
    });
  });
});
