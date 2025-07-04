import { mockRoutine } from "@/__mocks__/routine.mock";
import RoutineItem from "@/app/(main)/routines/_components/routineList/RoutineItem";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { useModal } from "@/providers/contexts/ModalContext";
import { LocalRoutine } from "@/types/models";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";

jest.mock("next/navigation");
jest.mock("@/providers/contexts/BottomSheetContext");
jest.mock("@/providers/contexts/ModalContext");

const mockedUseBottomSheet = jest.mocked(useBottomSheet);
const mockedUseModal = jest.mocked(useModal);
const mockedUseRouter = jest.mocked(useRouter);

const mockR: LocalRoutine = {
  ...mockRoutine.synced,
  updatedAt: new Date("2025-03-03").toISOString(),
};

describe("RoutineItem", () => {
  const mockOnPick = jest.fn();
  const mockCloseBottomSheet = jest.fn();
  const mockOpenModal = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
    mockedUseBottomSheet.mockReturnValue({
      closeBottomSheet: mockCloseBottomSheet,
      openBottomSheet: jest.fn(),
      isOpen: false,
    });
    mockedUseModal.mockReturnValue({
      openModal: mockOpenModal,
      closeModal: jest.fn(),
      isOpen: false,
      showError: jest.fn(),
    });
  });
  describe("렌더링", () => {
    it("루틴 아이템을 올바르게 렌더링한다", () => {
      render(<RoutineItem onPick={mockOnPick} routine={mockR} />);
      expect(screen.getByText(mockR.name)).toBeInTheDocument();
      expect(screen.getByText("마지막 수정: 2025. 3. 3.")).toBeInTheDocument();
    });
    it("새로운 루틴의 경우 마지막 수정 날짜가 없다", () => {
      const mockR: LocalRoutine = {
        ...mockRoutine.synced,
        updatedAt: undefined,
      };
      render(<RoutineItem onPick={mockOnPick} routine={mockR} />);
      expect(screen.getByText(mockR.name)).toBeInTheDocument();
      expect(screen.getByText("새로운 루틴")).toBeInTheDocument();
    });
  });

  describe("상호작용", () => {
    const user = userEvent.setup();
    it("onPick이 전달되지 않은 경우 아이템을 클릭하면 루틴 상세 페이지로 이동한다", async () => {
      render(<RoutineItem routine={mockR} />);
      await user.click(screen.getByText(mockR.name));

      expect(mockPush).toHaveBeenCalledWith(`/routines/${mockR.id}`);
    });

    it("onPick이 전달된 경우 아이템을 클릭하면 바텀시트를 닫고 모달이 열린다", async () => {
      render(<RoutineItem onPick={mockOnPick} routine={mockR} />);
      await user.click(screen.getByText(mockR.name));

      expect(mockCloseBottomSheet).toHaveBeenCalledTimes(1);
      expect(mockOpenModal).toHaveBeenCalledTimes(1);

      expect(mockOpenModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "루틴 선택",
          type: "confirm",
          message: `${mockR.name} 루틴을 선택하시겠습니까?`,
        })
      );
    });
  });
});
