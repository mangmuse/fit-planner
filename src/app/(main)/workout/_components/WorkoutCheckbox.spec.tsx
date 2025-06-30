import WorkoutCheckbox, {
  WorkoutCheckboxProps,
} from "@/app/(main)/workout/_components/WorkoutCheckbox";
import { workoutDetailService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/di");
jest.mock("@/providers/contexts/ModalContext");

const mockWorkoutDetailService = jest.mocked(workoutDetailService);
const mockUseModal = jest.mocked(useModal);

describe("WorkoutCheckbox", () => {
  const mockReload = jest.fn();
  let mockShowError: jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();

    mockShowError = jest.fn();

    mockUseModal.mockReturnValue({
      showError: mockShowError,
      openModal: jest.fn(),
      closeModal: jest.fn(),
      isOpen: false,
    });
  });

  const renderWorkoutCheckbox = (props?: Partial<WorkoutCheckboxProps>) => {
    const defaultProps: WorkoutCheckboxProps = {
      prevIsDone: false,
      id: 234,
      reload: mockReload,
    };
    render(<WorkoutCheckbox {...defaultProps} {...props} />);
  };

  it("prevIsDone이 false 이거나 undefined 이면 체크박스는 비활성화 되어있어야한다", () => {
    renderWorkoutCheckbox({ prevIsDone: false });

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("prevIsDone이 true 이면 체크박스는 활성화 되어있어야한다", () => {
    renderWorkoutCheckbox({ prevIsDone: true });

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  describe("체크박스를 클릭하면 상태가 변경된다", () => {
    it("false -> true", async () => {
      renderWorkoutCheckbox({ prevIsDone: false });

      const checkbox = screen.getByRole("checkbox");
      await userEvent.click(checkbox);

      expect(
        mockWorkoutDetailService.updateLocalWorkoutDetail
      ).toHaveBeenCalledWith({
        id: 234,
        isDone: true,
      });
      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it("true -> false", async () => {
      renderWorkoutCheckbox({ prevIsDone: true });

      const checkbox = screen.getByRole("checkbox");
      await userEvent.click(checkbox);

      expect(
        mockWorkoutDetailService.updateLocalWorkoutDetail
      ).toHaveBeenCalledWith({
        id: 234,
        isDone: false,
      });
      expect(mockReload).toHaveBeenCalledTimes(1);
    });
  });

  it("체크박스 상태 변경 도중 에러 발생시 에러 모달이 표시된다", async () => {
    jest
      .mocked(workoutDetailService.updateLocalWorkoutDetail)
      .mockRejectedValue(new Error("에러"));

    renderWorkoutCheckbox({ prevIsDone: false });

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    expect(mockShowError).toHaveBeenCalledWith(
      "운동 상태를 동기화하는데 실패했습니다"
    );

    // 에러가 발생했지만, 사용자가 클릭한 상태는 유지
    expect(checkbox).toBeChecked();
  });
});
