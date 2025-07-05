import { mockExercise } from "@/__mocks__/exercise.mock";
import ExerciseItem, {
  ExerciseItemProps,
} from "@/app/(main)/workout/[date]/exercises/_components/ExerciseItem";
import { exerciseService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { IExerciseService } from "@/types/services";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/di");
jest.mock("@/providers/contexts/ModalContext");

const mockExerciseService =
  exerciseService as unknown as jest.Mocked<IExerciseService>;
const mockUseModal = useModal as jest.Mock;
const mockExerciseData = mockExercise.bookmarked;

describe("ExerciseItem", () => {
  const mockOnAdd = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnReload = jest.fn();
  const mockOpenModal = jest.fn();
  const mockShowError = jest.fn();

  const renderExerciseItem = (overrides: Partial<ExerciseItemProps> = {}) => {
    const props = {
      exercise: mockExerciseData,
      isSelected: false,
      onAdd: mockOnAdd,
      onDelete: mockOnDelete,
      onReload: mockOnReload,
      ...overrides,
    };

    return render(<ExerciseItem {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseModal.mockReturnValue({
      openModal: mockOpenModal,
      showError: mockShowError,
    });
  });

  describe("렌더링", () => {
    it("선택되지 않았을 때 aria-selected 속성이 false이어야 한다", async () => {
      renderExerciseItem();

      const listItem = screen.getByRole("option");

      expect(listItem).toBeInTheDocument();
      expect(listItem).toHaveAttribute("aria-selected", "false");
    });

    it("선택되었을 때 aria-selected 속성이 true이어야 한다", async () => {
      renderExerciseItem({ isSelected: true });

      const listItem = screen.getByRole("option");

      expect(listItem).toBeInTheDocument();
      expect(listItem).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("상호작용", () => {
    const user = userEvent.setup();
    it("선택되지 않은 아이템을 클릭하면 onAdd 함수가 호출되어야 한다", async () => {
      renderExerciseItem({ isSelected: false });

      await user.click(screen.getByText(mockExerciseData.name));
      expect(mockOnAdd).toHaveBeenCalledWith(mockExerciseData);
      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it("선택된 아이템을 클릭하면 onDelete 함수가 호출되어야 한다", async () => {
      renderExerciseItem({ isSelected: true });

      await user.click(screen.getByText(mockExerciseData.name));
      expect(mockOnDelete).toHaveBeenCalledWith(mockExerciseData.id);
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it("북마크되지 않은 아이템의 북마크 버튼을 클릭하면, 즐겨찾기에 추가되어야 한다", async () => {
      renderExerciseItem({
        exercise: { ...mockExerciseData, isBookmarked: false },
      });
      await user.click(screen.getByLabelText("북마크"));

      expect(mockExerciseService.toggleLocalBookmark).toHaveBeenCalledWith(
        mockExerciseData.id,
        true
      );
      expect(mockOnReload).toHaveBeenCalledTimes(1);
      expect(mockShowError).not.toHaveBeenCalled();
    });

    it("북마크된 아이템의 북마크 버튼을 클릭하면, 확인 모달이 열려야한다.", async () => {
      renderExerciseItem({
        exercise: { ...mockExerciseData, isBookmarked: true },
      });
      await user.click(screen.getByLabelText("북마크 해제"));

      expect(mockOpenModal).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "confirm",
          title: "즐겨찾기에서 제거하시겠습니까?",
          message: mockExerciseData.name,
        })
      );
      expect(mockShowError).not.toHaveBeenCalled();
    });

    it("북마크 제거 모달에서 '확인' 을 누르면 북마크에서 제거되어야 한다", async () => {
      mockExerciseService.toggleLocalBookmark.mockResolvedValue();
      mockOpenModal.mockImplementation(({ onConfirm }) => {
        if (onConfirm) {
          onConfirm();
        }
      });

      renderExerciseItem({
        exercise: { ...mockExerciseData, isBookmarked: true },
      });
      await user.click(screen.getByLabelText("북마크 해제"));

      expect(mockExerciseService.toggleLocalBookmark).toHaveBeenCalledWith(
        mockExerciseData.id,
        false
      );
      await waitFor(() => {
        expect(mockOnReload).toHaveBeenCalledTimes(1);
      });
      expect(mockShowError).not.toHaveBeenCalled();
    });

    it("북마크 토글 도중 에러 발생시 showError가 호출된다", async () => {
      mockExerciseService.toggleLocalBookmark.mockRejectedValue(
        new Error("test")
      );

      renderExerciseItem({
        exercise: { ...mockExerciseData, isBookmarked: false },
        onReload: mockOnReload,
      });
      await user.click(screen.getByLabelText("북마크"));

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          "북마크 설정에 실패했습니다."
        );
      });

      expect(mockOnReload).not.toHaveBeenCalled();
    });
  });

  //;
});
