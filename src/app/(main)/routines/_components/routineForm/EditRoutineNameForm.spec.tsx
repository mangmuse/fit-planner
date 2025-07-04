jest.mock("@/lib/di");
jest.mock("@/providers/contexts/ModalContext");

import { render, screen, waitFor } from "@testing-library/react";
import EditRoutineNameForm, {
  EditRoutineNameFormProps,
} from "./EditRoutineNameForm";
import { routineService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import userEvent from "@testing-library/user-event";

const mockedRoutineService = jest.mocked(routineService);
const mockedUseModal = jest.mocked(useModal);

describe("EditRoutineNameForm", () => {
  const mockCloseModal = jest.fn();
  const mockReload = jest.fn();
  const mockPrevName = "기존 루틴명";
  const mockRoutineId = 555;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  mockedUseModal.mockReturnValue({
    closeModal: mockCloseModal,
    openModal: jest.fn(),
    isOpen: false,
    showError: jest.fn(),
  });

  const renderComponent = (props?: Partial<EditRoutineNameFormProps>) => {
    render(
      <EditRoutineNameForm
        prevName={mockPrevName}
        routineId={mockRoutineId}
        reload={mockReload}
        {...props}
      />
    );
  };

  describe("렌더링", () => {
    it("최초 렌더링시에 이전 루틴명이 입력되어 있다", async () => {
      renderComponent();
      expect(screen.getByDisplayValue(mockPrevName)).toBeInTheDocument();
    });

    describe("상호작용", () => {
      const user = userEvent.setup();
      it("루틴명 변경 버튼을 누르면 루틴명이 변경되고 모달이 닫혀야 한다", async () => {
        renderComponent();
        const input = screen.getByDisplayValue(mockPrevName);

        await user.clear(input);
        await user.type(input, "새로운 루틴명");

        await user.click(screen.getByText("변경"));

        expect(mockedRoutineService.updateLocalRoutine).toHaveBeenCalledWith({
          id: mockRoutineId,
          name: "새로운 루틴명",
        });
        expect(mockReload).toHaveBeenCalled();
        expect(mockCloseModal).toHaveBeenCalled();
      });

      it("텍스트가 없으면 버튼이 비활성화 되어야한다", async () => {
        renderComponent();
        const input = screen.getByDisplayValue(mockPrevName);

        await user.clear(input);

        const button = screen.getByText("변경");
        await user.click(button);

        expect(button).toBeDisabled();
        expect(mockedRoutineService.updateLocalRoutine).not.toHaveBeenCalled();
        expect(mockReload).not.toHaveBeenCalled();
        expect(mockCloseModal).not.toHaveBeenCalled();
      });
    });
  });
});
