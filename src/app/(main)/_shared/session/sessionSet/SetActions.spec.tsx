jest.mock("@/lib/di");
jest.mock("@/providers/contexts/ModalContext");

import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import SetActions, {
  SetActionsProps,
} from "@/app/(main)/_shared/session/sessionSet/SetActions";
import { routineDetailService, workoutDetailService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockWorkoutDetailService = jest.mocked(workoutDetailService);
const mockRoutineDetailService = jest.mocked(routineDetailService);
const mockUseModal = jest.mocked(useModal);

describe("SetActions", () => {
  const mockShowError = jest.fn();
  const mockReload = jest.fn();
  const mockReorder = jest.fn();
  const mockWD = { ...mockWorkoutDetail.past, id: 500 };
  const mockRD = { ...mockRoutineDetail.past, id: 600 };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseModal.mockReturnValue({
      showError: mockShowError,
      openModal: jest.fn(),
      closeModal: jest.fn(),
      isOpen: false,
    });
    jest.clearAllMocks();
  });

  const renderSetActions = (props?: Partial<SetActionsProps>) => {
    const defaultProps: SetActionsProps = {
      lastValue: mockWD,
      reload: mockReload,
      reorderAfterDelete: mockReorder,
    };
    render(<SetActions {...defaultProps} {...props} />);
  };

  describe("lastValue가 workoutDetail", () => {
    it("세트 추가 버튼을 클릭하면 세트가 추가된다", async () => {
      renderSetActions();

      const addSetBtn = screen.getByRole("button", { name: "Add Set" });
      expect(addSetBtn).toBeInTheDocument();
      await userEvent.click(addSetBtn);

      expect(mockWorkoutDetailService.addSetToWorkout).toHaveBeenCalledWith(
        mockWD
      );
      expect(mockRoutineDetailService.addSetToRoutine).not.toHaveBeenCalled();
      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it("세트 삭제 버튼을 클릭하면 세트가 삭제된다", async () => {
      renderSetActions({ lastValue: mockWD });

      const deleteSetBtn = screen.getByRole("button", { name: "Delete Set" });
      expect(deleteSetBtn).toBeInTheDocument();
      await userEvent.click(deleteSetBtn);

      expect(mockWorkoutDetailService.deleteWorkoutDetail).toHaveBeenCalledWith(
        mockWD.id
      );
      expect(
        mockRoutineDetailService.deleteRoutineDetail
      ).not.toHaveBeenCalled();
      expect(mockReorder).toHaveBeenCalledWith(mockWD.exerciseOrder);
      expect(mockReload).toHaveBeenCalledTimes(1);
    });
  });
  describe("lastValue가 routineDetail", () => {
    it("세트 추가 버튼을 클릭하면 세트가 추가된다", async () => {
      renderSetActions({ lastValue: mockRD });

      const addSetBtn = screen.getByRole("button", { name: "Add Set" });
      expect(addSetBtn).toBeInTheDocument();
      await userEvent.click(addSetBtn);

      expect(mockRoutineDetailService.addSetToRoutine).toHaveBeenCalledWith(
        mockRD
      );
      expect(mockReload).toHaveBeenCalledTimes(1);

      expect(mockWorkoutDetailService.addSetToWorkout).not.toHaveBeenCalled();
    });
    it("세트 삭제 버튼을 클릭하면 세트가 삭제된다", async () => {
      renderSetActions({ lastValue: mockRD });

      const deleteSetBtn = screen.getByRole("button", { name: "Delete Set" });
      expect(deleteSetBtn).toBeInTheDocument();
      await userEvent.click(deleteSetBtn);

      expect(mockRoutineDetailService.deleteRoutineDetail).toHaveBeenCalledWith(
        mockRD.id
      );
      expect(mockReorder).toHaveBeenCalledWith(mockRD.exerciseOrder);
      expect(mockReload).toHaveBeenCalledTimes(1);

      expect(
        mockWorkoutDetailService.deleteWorkoutDetail
      ).not.toHaveBeenCalled();
    });
  });

  it("세트 추가 도중 에러가 발생하면 에러 모달이 표시된다", async () => {
    renderSetActions();

    const mockError = new Error("추가 실패");
    mockWorkoutDetailService.addSetToWorkout.mockRejectedValue(mockError);

    const addSetBtn = screen.getByRole("button", { name: "Add Set" });
    expect(addSetBtn).toBeInTheDocument();
    await userEvent.click(addSetBtn);

    expect(mockShowError).toHaveBeenCalledWith("세트 추가에 실패했습니다");
  });

  it("세트 삭제 도중 에러가 발생하면 에러 모달이 표시된다", async () => {
    renderSetActions({ lastValue: mockWD });

    const mockError = new Error("삭제 실패");
    mockWorkoutDetailService.deleteWorkoutDetail.mockRejectedValue(mockError);

    const deleteSetBtn = screen.getByRole("button", { name: "Delete Set" });
    expect(deleteSetBtn).toBeInTheDocument();
    await userEvent.click(deleteSetBtn);

    expect(mockShowError).toHaveBeenCalledWith("세트 삭제에 실패했습니다");
  });
});
