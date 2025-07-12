jest.mock("@/providers/contexts/ModalContext");
jest.mock("@/app/(main)/_shared/session/SessionContainer");
jest.mock("@/lib/di");

import { mockExercise } from "@/__mocks__/exercise.mock";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { useSessionData } from "@/app/(main)/_shared/session/SessionContainer";
import SessionItem, {
  SessionItemProps,
} from "@/app/(main)/_shared/session/sessionSet/SessionItem";

import { routineDetailService, workoutDetailService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { createMockSessionData } from "@/test-utils/mocks/sessionData.mock";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUseModal = jest.mocked(useModal);
const mockWorkoutDetailService = jest.mocked(workoutDetailService);
const mockRoutineDetailService = jest.mocked(routineDetailService);
const mockUseSessionData = jest.mocked(useSessionData);

describe("SessionItem", () => {
  const mockShowError = jest.fn();

  const mockReload = jest.fn();
  const mockReorderExerciseOrderAfterDelete = jest.fn();
  const mockReorderSetOrderAfterDelete = jest.fn();
  const mockUpdateDetailInGroups = jest.fn();
  const mockRemoveDetailFromGroup = jest.fn();

  const mockWD = mockWorkoutDetail.past;
  const mockRD = mockRoutineDetail.past;
  const mockEx = mockExercise.bookmarked;
  const mockPrevWD = { ...mockWorkoutDetail.past, weight: 100, reps: 10 };
  const mockGroup = {
    exerciseOrder: 1,
    details: [mockWD],
  };
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseModal.mockReturnValue({
      showError: mockShowError,
      openModal: jest.fn(),
      closeModal: jest.fn(),
      isOpen: false,
    });

    mockUseSessionData.mockReturnValue(
      createMockSessionData({
        reorderExerciseOrderAfterDelete: mockReorderExerciseOrderAfterDelete,
        reorderSetOrderAfterDelete: mockReorderSetOrderAfterDelete,
        updateDetailInGroups: mockUpdateDetailInGroups,
        removeDetailFromGroup: mockRemoveDetailFromGroup,
        reload: mockReload,
      })
    );
  });

  const renderWorkoutItem = (props?: Partial<SessionItemProps>) => {
    const defaultProps: SessionItemProps = {
      detail: mockWD,
      prevWorkoutDetail: mockPrevWD,
      group: mockGroup,
      isLastSet: false,
    };

    render(<SessionItem {...defaultProps} {...props} />);
  };

  describe("렌더링", () => {
    it("detail이 전달되면 전달받은 값이 표시된다", () => {
      renderWorkoutItem();

      const setOrder = screen.getByTestId("set-order");
      expect(setOrder).toHaveTextContent(mockWD.setOrder.toString());

      const weight = screen.getByTestId("weight");
      expect(weight).toHaveValue(mockWD.weight ?? 0);

      const reps = screen.getByTestId("reps");
      expect(reps).toHaveValue(mockWD.reps ?? 0);

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

      const updatedDetail = {
        ...mockWD,
        weight: 567,
      };
      expect(
        mockWorkoutDetailService.updateLocalWorkoutDetail
      ).toHaveBeenCalledWith(updatedDetail);

      expect(mockUpdateDetailInGroups).toHaveBeenCalledWith(updatedDetail);

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

      const updatedDetail = {
        ...mockRD,
        reps: 10,
      };

      expect(
        mockRoutineDetailService.updateLocalRoutineDetail
      ).toHaveBeenCalledWith(updatedDetail);

      expect(mockUpdateDetailInGroups).toHaveBeenCalledWith(updatedDetail);

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

    describe("루틴 세트 삭제", () => {
      it("루틴의 경우 삭제 버튼을 클릭하면 루틴 상세 삭제 후 재정렬 후 리로드한다", async () => {
        renderWorkoutItem({ detail: mockRD });

        const deleteButton = screen.getByRole("button", { name: "삭제" });
        await user.click(deleteButton);

        expect(
          mockRoutineDetailService.deleteRoutineDetail
        ).toHaveBeenCalledWith(mockRD.id);
        expect(mockRemoveDetailFromGroup).toHaveBeenCalledWith(mockRD.id);
      });

      it("삭제된 세트가 해당 그룹의 마지막세트이면 exerciseOrder를 재정렬한다", async () => {
        const mockGroup = {
          exerciseOrder: 123,
          details: [mockRD],
        };
        renderWorkoutItem({
          detail: mockRD,
          group: mockGroup,
          isLastSet: true,
        });

        const deleteButton = screen.getByRole("button", { name: "삭제" });
        await user.click(deleteButton);

        expect(
          mockRoutineDetailService.deleteRoutineDetail
        ).toHaveBeenCalledWith(mockRD.id);
        expect(mockRemoveDetailFromGroup).toHaveBeenCalledWith(mockRD.id);
        expect(mockReorderExerciseOrderAfterDelete).toHaveBeenCalledWith(123);
        expect(mockReorderSetOrderAfterDelete).not.toHaveBeenCalled();
      });

      it("삭제된 세트가 해당 그룹의 마지막세트가 아니면 setOrder를 재정렬한다", async () => {
        renderWorkoutItem({
          detail: mockRD,
        });

        const deleteButton = screen.getByRole("button", { name: "삭제" });
        await user.click(deleteButton);

        expect(
          mockRoutineDetailService.deleteRoutineDetail
        ).toHaveBeenCalledWith(mockRD.id);
        expect(mockRemoveDetailFromGroup).toHaveBeenCalledWith(mockRD.id);
        expect(mockReorderSetOrderAfterDelete).toHaveBeenCalledWith(
          mockRD.exerciseId,
          mockRD.setOrder
        );
        expect(mockReorderExerciseOrderAfterDelete).not.toHaveBeenCalled();
      });
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

      const deleteButton = screen.getByRole("button", { name: "삭제" });
      await user.click(deleteButton);

      expect(mockShowError).toHaveBeenCalledWith("운동 삭제에 실패했습니다");
    });
  });
});
