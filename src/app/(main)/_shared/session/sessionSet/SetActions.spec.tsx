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

  const mockWD = { ...mockWorkoutDetail.past, id: 500 };
  const mockRD = { ...mockRoutineDetail.past, id: 600 };
  const mockAddDetailToGroup = jest.fn();
  const mockRemoveDetailFromGroup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseModal.mockReturnValue({
      showError: mockShowError,
      openModal: jest.fn(),
      closeModal: jest.fn(),
      isOpen: false,
    });
  });

  const renderSetActions = (props?: Partial<SetActionsProps>) => {
    const defaultProps: SetActionsProps = {
      lastValue: mockWD,
      addDetailToGroup: mockAddDetailToGroup,
      removeDetailFromGroup: mockRemoveDetailFromGroup,
    };
    render(<SetActions {...defaultProps} {...props} />);
  };

  describe("lastValue가 workoutDetail", () => {
    it("세트 추가 버튼을 클릭하면 세트가 추가된다", async () => {
      mockWorkoutDetailService.addSetToWorkout.mockResolvedValue({
        ...mockWD,
        id: 501,
      });

      renderSetActions();

      const addSetBtn = screen.getByRole("button", { name: "Add Set" });
      expect(addSetBtn).toBeInTheDocument();
      await userEvent.click(addSetBtn);

      expect(mockWorkoutDetailService.addSetToWorkout).toHaveBeenCalledWith(
        mockWD
      );
      expect(mockRoutineDetailService.addSetToRoutine).not.toHaveBeenCalled();
      expect(mockAddDetailToGroup).toHaveBeenCalledWith(
        {
          ...mockWD,
          id: 501,
        },
        mockWD
      );
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

      expect(mockRemoveDetailFromGroup).toHaveBeenCalledWith(mockWD.id);
    });
  });
  describe("lastValue가 routineDetail", () => {
    mockRoutineDetailService.addSetToRoutine.mockResolvedValue({
      ...mockRD,
      id: 601,
    });

    it("세트 추가 버튼을 클릭하면 세트가 추가된다", async () => {
      renderSetActions({ lastValue: mockRD });

      const addSetBtn = screen.getByRole("button", { name: "Add Set" });
      expect(addSetBtn).toBeInTheDocument();
      await userEvent.click(addSetBtn);

      expect(mockRoutineDetailService.addSetToRoutine).toHaveBeenCalledWith(
        mockRD
      );

      expect(mockAddDetailToGroup).toHaveBeenCalledWith(
        {
          ...mockRD,
          id: 601,
        },
        mockRD
      );

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

      expect(mockRemoveDetailFromGroup).toHaveBeenCalledWith(mockRD.id);

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
