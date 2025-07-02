import SessionSequence, {
  DetailGroup,
} from "@/app/(main)/_shared/session/sessionSequence/SessionSequence";
import { routineDetailService, workoutDetailService } from "@/lib/di";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { useModal } from "@/providers/contexts/ModalContext";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { mockOnDragEnd } from "@/__mocks__/@dnd-kit/core";

jest.mock("@/lib/di");
jest.mock("@/providers/contexts/BottomSheetContext");
jest.mock("@/providers/contexts/ModalContext");
jest.mock("@/app/(main)/workout/_utils/checkIsWorkoutDetails", () => ({
  isWorkoutDetail: jest.fn((detail) => "workoutId" in detail),
}));
jest.mock("@/app/(main)/workout/_utils/getGroupedDetails", () => ({
  reorderDetailGroups: jest.fn((groups, activeId, overId) => {
    const activeIndex = groups.findIndex(
      (g: DetailGroup) => g.exerciseOrder.toString() === activeId
    );
    const overIndex = groups.findIndex(
      (g: DetailGroup) => g.exerciseOrder.toString() === overId
    );
    const newGroups = [...groups];
    const [movedItem] = newGroups.splice(activeIndex, 1);
    newGroups.splice(overIndex, 0, movedItem);

    return newGroups.map((group, index) => ({
      ...group,
      exerciseOrder: index + 1,
    }));
  }),
}));

jest.mock("@/app/(main)/_shared/session/sessionSequence/SortableItem", () => {
  return function MockSortableItem({
    id,
    value,
  }: {
    id: string;
    value: string;
  }) {
    return (
      <li data-testid={`sortable-item-${id}`}>
        <span>{value}</span>
      </li>
    );
  };
});

const mockedUseBottomSheet = jest.mocked(useBottomSheet);
const mockedUseModal = jest.mocked(useModal);
const mockedWorkoutDetailService = jest.mocked(workoutDetailService);
const mockedRoutineDetailService = jest.mocked(routineDetailService);

const mockDetailGroups: DetailGroup[] = [
  {
    exerciseOrder: 1,
    details: [
      mockWorkoutDetail.new({
        id: 1,
        workoutId: 100,
        exerciseId: 1,
        exerciseName: "벤치프레스",
        exerciseOrder: 1,
      }),
    ],
  },
  {
    exerciseOrder: 2,
    details: [
      mockRoutineDetail.new({
        id: 2,
        routineId: 200,
        exerciseId: 2,
        exerciseName: "스쿼트",
        exerciseOrder: 2,
      }),
    ],
  },
];

describe("SessionSequence", () => {
  const mockReload = jest.fn();
  const mockCloseBottomSheet = jest.fn();
  const mockShowError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseBottomSheet.mockReturnValue({
      closeBottomSheet: mockCloseBottomSheet,
      openBottomSheet: jest.fn(),
      isOpen: false,
    });
    mockedUseModal.mockReturnValue({
      showError: mockShowError,
      closeModal: jest.fn(),
      openModal: jest.fn(),
      isOpen: false,
    });
    mockedWorkoutDetailService.updateLocalWorkoutDetail.mockResolvedValue(
      undefined
    );
    mockedRoutineDetailService.updateLocalRoutineDetail.mockResolvedValue(
      undefined
    );
  });

  describe("렌더링", () => {
    it("초기 운동 목록이 올바르게 표시된다", () => {
      render(
        <SessionSequence detailGroups={mockDetailGroups} reload={mockReload} />
      );

      expect(screen.getByText("벤치프레스")).toBeInTheDocument();
      expect(screen.getByText("스쿼트")).toBeInTheDocument();
    });

    it("순서 변경 완료 버튼이 표시된다", () => {
      render(
        <SessionSequence detailGroups={mockDetailGroups} reload={mockReload} />
      );

      expect(
        screen.getByRole("button", { name: "순서 변경 완료" })
      ).toBeInTheDocument();
    });
  });

  describe("드래그 앤 드롭", () => {
    it("드래그 앤 드롭으로 순서를 변경하면 화면에 즉시 반영된다", () => {
      render(
        <SessionSequence detailGroups={mockDetailGroups} reload={mockReload} />
      );

      let items = screen.getAllByRole("listitem");
      expect(items[0]).toHaveTextContent("벤치프레스");
      expect(items[1]).toHaveTextContent("스쿼트");

      if (mockOnDragEnd) {
        mockOnDragEnd({
          active: { id: "1" },
          over: { id: "2" },
        });
      }

      // 순서 변경
      items = screen.getAllByRole("listitem");
      expect(items[0]).toHaveTextContent("벤치프레스");
      expect(items[1]).toHaveTextContent("스쿼트");
    });

    it("드래그를 취소하면 순서가 변경되지 않는다", () => {
      render(
        <SessionSequence detailGroups={mockDetailGroups} reload={mockReload} />
      );

      const items = screen.getAllByRole("listitem");
      expect(items[0]).toHaveTextContent("벤치프레스");
      expect(items[1]).toHaveTextContent("스쿼트");

      // 드래그 취소
      if (mockOnDragEnd) {
        mockOnDragEnd({
          active: { id: "1" },
          over: null,
        });
      }

      // 순서가 변경되지 않음
      const itemsAfter = screen.getAllByRole("listitem");
      expect(itemsAfter[0]).toHaveTextContent("벤치프레스");
      expect(itemsAfter[1]).toHaveTextContent("스쿼트");
    });
  });

  describe("순서 변경 저장", () => {
    it("순서 변경 완료 버튼 클릭 시 올바른 서비스가 호출된다", async () => {
      const user = userEvent.setup();
      render(
        <SessionSequence detailGroups={mockDetailGroups} reload={mockReload} />
      );

      const saveButton = screen.getByRole("button", { name: "순서 변경 완료" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          mockedWorkoutDetailService.updateLocalWorkoutDetail
        ).toHaveBeenCalledWith({
          id: 1,
          exerciseOrder: 1,
        });

        expect(
          mockedRoutineDetailService.updateLocalRoutineDetail
        ).toHaveBeenCalledWith({
          id: 2,
          exerciseOrder: 2,
        });
      });
    });

    it("저장 후 reload와 closeBottomSheet가 호출된다", async () => {
      const user = userEvent.setup();
      render(
        <SessionSequence detailGroups={mockDetailGroups} reload={mockReload} />
      );

      const saveButton = screen.getByRole("button", { name: "순서 변경 완료" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockReload).toHaveBeenCalledTimes(1);
        expect(mockCloseBottomSheet).toHaveBeenCalledTimes(1);
      });
    });

    it("여러 개의 detail을 가진 그룹도 올바르게 처리된다", async () => {
      const user = userEvent.setup();
      const multipleDetailsGroups: DetailGroup[] = [
        {
          exerciseOrder: 1,
          details: [
            mockWorkoutDetail.new({ id: 1, exerciseName: "벤치프레스" }),
            mockWorkoutDetail.new({
              id: 2,
              exerciseName: "인클라인 벤치프레스",
            }),
          ],
        },
        {
          exerciseOrder: 2,
          details: [mockRoutineDetail.new({ id: 3, exerciseName: "스쿼트" })],
        },
      ];

      render(
        <SessionSequence
          detailGroups={multipleDetailsGroups}
          reload={mockReload}
        />
      );

      const saveButton = screen.getByRole("button", { name: "순서 변경 완료" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          mockedWorkoutDetailService.updateLocalWorkoutDetail
        ).toHaveBeenCalledTimes(2);
        expect(
          mockedWorkoutDetailService.updateLocalWorkoutDetail
        ).toHaveBeenCalledWith({ id: 1, exerciseOrder: 1 });
        expect(
          mockedWorkoutDetailService.updateLocalWorkoutDetail
        ).toHaveBeenCalledWith({ id: 2, exerciseOrder: 1 });
      });
    });

    it("서비스 호출이 실패하면 에러 모달이 표시된다", async () => {
      const user = userEvent.setup();
      mockedWorkoutDetailService.updateLocalWorkoutDetail.mockRejectedValue(
        new Error("API Error")
      );

      render(
        <SessionSequence detailGroups={mockDetailGroups} reload={mockReload} />
      );

      const saveButton = screen.getByRole("button", { name: "순서 변경 완료" });

      await user.click(saveButton);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          "순서 변경에 실패했습니다. 다시 시도해주세요."
        );
      });

      expect(mockReload).not.toHaveBeenCalled();
      expect(mockCloseBottomSheet).not.toHaveBeenCalled();
    });

    it("순서 변경 후 저장하면 변경된 순서로 서비스가 호출된다", async () => {
      const user = userEvent.setup();
      render(
        <SessionSequence detailGroups={mockDetailGroups} reload={mockReload} />
      );

      if (mockOnDragEnd) {
        mockOnDragEnd({
          active: { id: "1" },
          over: { id: "2" },
        });
      }

      const saveButton = screen.getByRole("button", { name: "순서 변경 완료" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          mockedWorkoutDetailService.updateLocalWorkoutDetail
        ).toHaveBeenCalledWith({
          id: 1,
          exerciseOrder: 2,
        });

        expect(
          mockedRoutineDetailService.updateLocalRoutineDetail
        ).toHaveBeenCalledWith({
          id: 2,
          exerciseOrder: 1,
        });
      });
    });
  });
});
