import CustomExerciseForm from "@/app/(main)/workout/[date]/exercises/_components/CustomExerciseForm";
import { exerciseService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { Category } from "@/types/filters";
import { IExerciseService } from "@/types/services";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSession } from "next-auth/react";

jest.mock("@/lib/di");
jest.mock("@/providers/contexts/ModalContext");
jest.mock("next-auth/react");

const mockExerciseService =
  exerciseService as unknown as jest.Mocked<IExerciseService>;
const mockUseModal = useModal as jest.Mock;
const mockUseSession = useSession as jest.Mock;

describe("Name of the group", () => {
  const mockReload = jest.fn();
  const mockCloseModal = jest.fn();
  const user = userEvent.setup();
  const renderForm = () => {
    render(<CustomExerciseForm reload={mockReload} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseModal.mockReturnValue({
      closeModal: mockCloseModal,
    });
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-123" } },
      status: "authenticated",
    });
  });

  it("올바른 값을 입력하고 '추가' 버튼을 클릭하면 서비스와 콜백 함수들이 호출되어야 한다", async () => {
    mockExerciseService.addLocalExercise.mockResolvedValue();
    renderForm();

    const exerciseNameInput = screen.getByPlaceholderText("예: 덤벨 컬");

    const categorySelect = screen.getByRole("combobox");

    await user.type(exerciseNameInput, "점프하기");
    await user.selectOptions(categorySelect, "하체");

    await user.click(screen.getByText("추가"));

    expect(mockExerciseService.addLocalExercise).toHaveBeenCalledWith({
      userId: "user-123",
      name: "점프하기",
      category: "하체",
    });
    expect(mockReload).toHaveBeenCalled();
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it("운동 이름이 비어있으면 '추가' 버튼이 비활성화되어야 한다", async () => {
    renderForm();

    const categorySelect = screen.getByRole("combobox");
    const nameInput = screen.getByPlaceholderText("예: 덤벨 컬");

    await user.type(nameInput, "   ");
    await user.selectOptions(categorySelect, "팔");

    expect(screen.getByText("추가")).toBeDisabled();
  });

  it("취소 버튼을 클릭하면 closeModal 함수가 호출되어야 한다", async () => {
    renderForm();

    await user.click(screen.getByText("취소"));

    expect(mockCloseModal).toHaveBeenCalledTimes(1);
    expect(mockExerciseService.addLocalExercise).not.toHaveBeenCalled();
    expect(mockReload).not.toHaveBeenCalled();
  });
});
