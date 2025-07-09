import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import SessionCheckbox, {
  SessionCheckboxProps,
} from "@/app/(main)/_shared/session/sessionSet/SessionCheckbox";
import { workoutDetailService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/di");
jest.mock("@/providers/contexts/ModalContext");

const mockWorkoutDetailService = jest.mocked(workoutDetailService);
const mockUseModal = jest.mocked(useModal);

const mockWD = { ...mockWorkoutDetail.past, id: 234 };

describe("SessionCheckbox", () => {
  const mockUpdateDetailInGroups = jest.fn();

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

  const renderSessionCheckbox = (props?: Partial<SessionCheckboxProps>) => {
    const defaultProps: SessionCheckboxProps = {
      prevIsDone: false,
      detail: mockWD,
      updateDetailInGroups: mockUpdateDetailInGroups,
    };
    render(<SessionCheckbox {...defaultProps} {...props} />);
  };

  it("prevIsDone이 false 이거나 undefined 이면 체크박스는 비활성화 되어있어야한다", () => {
    renderSessionCheckbox({ prevIsDone: false });

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("prevIsDone이 true 이면 체크박스는 활성화 되어있어야한다", () => {
    renderSessionCheckbox({ prevIsDone: true });

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  describe("체크박스를 클릭하면 상태가 변경된다", () => {
    it("false -> true", async () => {
      renderSessionCheckbox({ prevIsDone: false });

      const checkbox = screen.getByRole("checkbox");
      await userEvent.click(checkbox);
      const updatedDetail = {
        ...mockWD,
        isDone: true,
      };

      expect(
        mockWorkoutDetailService.updateLocalWorkoutDetail
      ).toHaveBeenCalledWith(updatedDetail);
      expect(mockUpdateDetailInGroups).toHaveBeenCalledWith(updatedDetail);
    });

    it("true -> false", async () => {
      renderSessionCheckbox({ prevIsDone: true });

      const checkbox = screen.getByRole("checkbox");
      await userEvent.click(checkbox);
      const updatedDetail = {
        ...mockWD,
        isDone: false,
      };
      expect(
        mockWorkoutDetailService.updateLocalWorkoutDetail
      ).toHaveBeenCalledWith(updatedDetail);
      expect(mockUpdateDetailInGroups).toHaveBeenCalledWith(updatedDetail);
    });
  });

  it("체크박스 상태 변경 도중 에러 발생시 에러 모달이 표시된다", async () => {
    jest
      .mocked(workoutDetailService.updateLocalWorkoutDetail)
      .mockRejectedValue(new Error("에러"));

    renderSessionCheckbox({ prevIsDone: false });

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    expect(mockShowError).toHaveBeenCalledWith(
      "운동 상태를 동기화하는데 실패했습니다"
    );

    expect(checkbox).toBeChecked();
  });
});
