jest.mock("@/providers/contexts/ModalContext");
jest.mock("@/providers/contexts/BottomSheetContext");
jest.mock("@/lib/di");

jest.mock("framer-motion", () => ({
  ...jest.requireActual("framer-motion"),
  motion: {
    div: jest.fn(({ animate, ...props }) => {
      const position = animate?.x === "10%" ? "kg" : "lbs";
      return (
        <div
          data-testid="motion-unit-selector"
          data-position={position}
          {...props}
        />
      );
    }),
  },
}));

import { mockExercise } from "@/__mocks__/exercise.mock";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { useModal } from "@/providers/contexts/ModalContext";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import {
  exerciseService,
  workoutDetailService,
  routineDetailService,
} from "@/lib/di";
import {
  LocalExercise,
  LocalWorkoutDetail,
  LocalRoutineDetail,
  Saved,
} from "@/types/models";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KG_TO_LBS } from "@/util/weightConversion";
import SessionDetailGroupOptions, {
  SessionDetailGroupOptionsProps,
} from "@/app/(main)/_shared/session/exerciseGroup/SessionDetailGroupOptions";

const mockUseModal = jest.mocked(useModal);
const mockUseBottomSheet = jest.mocked(useBottomSheet);
const mockExerciseService = jest.mocked(exerciseService);
const mockWorkoutDetailService = jest.mocked(workoutDetailService);
const mockRoutineDetailService = jest.mocked(routineDetailService);

describe("SessionDetailGroupOptions", () => {
  const mockOpenModal = jest.fn();
  const mockCloseBottomSheet = jest.fn();
  const mockOpenBottomSheet = jest.fn();
  const mockShowError = jest.fn();
  const mockLoadExercises = jest.fn();
  const mockReload = jest.fn();
  const mockReorderExerciseOrderAfterDelete = jest.fn();
  const mockUpdateMultipleDetailsInGroups = jest.fn();
  const mockRemoveMultipleDetailsInGroup = jest.fn();

  const mockExerciseData: Saved<LocalExercise> = {
    ...mockExercise.list[0],
    id: 1,
  };
  const mockWD = {
    ...mockWorkoutDetail.past,
    exerciseOrder: 1,
    weightUnit: "kg" as const,
  };
  const mockWorkoutDetails: Saved<LocalWorkoutDetail>[] = [mockWD];
  const mockRoutineDetails: Saved<LocalRoutineDetail>[] = [
    { ...mockRoutineDetail.past, exerciseOrder: 1 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseModal.mockReturnValue({
      openModal: mockOpenModal,
      closeModal: jest.fn(),
      showError: mockShowError,
      isOpen: false,
    });

    mockUseBottomSheet.mockReturnValue({
      openBottomSheet: mockOpenBottomSheet,
      closeBottomSheet: mockCloseBottomSheet,
      isOpen: false,
    });

    mockExerciseService.updateLocalExercise.mockResolvedValue(1);
    mockWorkoutDetailService.deleteWorkoutDetails.mockResolvedValue();
    mockWorkoutDetailService.updateLocalWorkoutDetail.mockResolvedValue();
    mockRoutineDetailService.deleteRoutineDetails.mockResolvedValue();
    mockRoutineDetailService.updateLocalRoutineDetail.mockResolvedValue();
  });

  const renderSessionDetailGroupOptions = (
    props?: Partial<SessionDetailGroupOptionsProps>
  ) => {
    const defaultProps: SessionDetailGroupOptionsProps = {
      exercise: mockExerciseData,
      exerciseOrder: 1,
      reorderExerciseOrderAfterDelete: mockReorderExerciseOrderAfterDelete,
      details: mockWorkoutDetails,
      loadExercises: mockLoadExercises,
      reload: mockReload,
      updateMultipleDetailsInGroups: mockUpdateMultipleDetailsInGroups,
      removeMultipleDetailsInGroup: mockRemoveMultipleDetailsInGroup,

      ...props,
    };

    return render(<SessionDetailGroupOptions {...defaultProps} />);
  };

  describe("렌더링", () => {
    it("운동 이름과 기본 옵션들을 렌더링해야 한다", () => {
      renderSessionDetailGroupOptions();

      expect(screen.getByText(mockExerciseData.name)).toBeInTheDocument();
      expect(screen.getByText("운동 교체")).toBeInTheDocument();
      expect(screen.getByText("메모 남기기")).toBeInTheDocument();
      expect(screen.getByText("삭제하기")).toBeInTheDocument();
    });

    it("단위 선택기를 올바른 초기 상태로 렌더링해야 한다", () => {
      renderSessionDetailGroupOptions({
        details: [{ ...mockWD, weightUnit: "kg" }],
      });

      expect(screen.getByRole("button", { name: "kg" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "lbs" })).toBeInTheDocument();

      const motionDiv = screen.getByTestId("motion-unit-selector");
      expect(motionDiv).toHaveAttribute("data-position", "kg");
    });

    it("lbs 단위일 때 모션 위치가 lbs로 설정되어야 한다", () => {
      renderSessionDetailGroupOptions({
        details: [{ ...mockWD, weightUnit: "lbs" }],
      });

      const motionDiv = screen.getByTestId("motion-unit-selector");
      expect(motionDiv).toHaveAttribute("data-position", "lbs");
    });
  });

  describe("상호작용", () => {
    it("운동 교체 클릭 시 ExercisesContainer를 포함한 바텀시트를 열어야 한다", async () => {
      const user = userEvent.setup();
      renderSessionDetailGroupOptions();

      await user.click(screen.getByText("운동 교체"));

      expect(mockCloseBottomSheet).toHaveBeenCalledTimes(1);
      expect(mockOpenBottomSheet).toHaveBeenCalledWith({
        height: "100dvh",
        rounded: false,
        children: expect.any(Object),
      });
    });

    it("메모 남기기 클릭 시 ExerciseMemo를 포함한 모달을 열어야 한다", async () => {
      const user = userEvent.setup();
      renderSessionDetailGroupOptions();

      await user.click(screen.getByText("메모 남기기"));

      expect(mockCloseBottomSheet).toHaveBeenCalledTimes(1);
      expect(mockOpenModal).toHaveBeenCalledWith({
        type: "generic",
        children: expect.any(Object),
      });
    });

    it("삭제하기 클릭 시 확인 모달을 열어야 한다", async () => {
      const user = userEvent.setup();
      renderSessionDetailGroupOptions();

      await user.click(screen.getByText("삭제하기"));

      expect(mockCloseBottomSheet).toHaveBeenCalledTimes(1);
      expect(mockOpenModal).toHaveBeenCalledWith({
        type: "confirm",
        title: mockExerciseData.name,
        message: "정말로 삭제하시겠습니까?",
        onConfirm: expect.any(Function),
      });
    });

    it("워크아웃 세부사항 삭제 확인 시 적절한 서비스를 호출해야 한다", async () => {
      const user = userEvent.setup();

      mockOpenModal.mockImplementation(({ onConfirm }) => {
        onConfirm?.();
      });

      renderSessionDetailGroupOptions({
        details: mockWorkoutDetails,
        exerciseOrder: 10,
      });

      await user.click(screen.getByText("삭제하기"));

      await waitFor(() => {
        expect(
          mockWorkoutDetailService.deleteWorkoutDetails
        ).toHaveBeenCalledWith(mockWorkoutDetails);

        expect(mockReorderExerciseOrderAfterDelete).toHaveBeenCalledWith(10);
        expect(mockRemoveMultipleDetailsInGroup).toHaveBeenCalledWith(
          mockWorkoutDetails
        );
      });
    });

    it("루틴 세부사항 삭제 확인 시 적절한 서비스를 호출해야 한다", async () => {
      const user = userEvent.setup();

      mockOpenModal.mockImplementation(({ onConfirm }) => {
        onConfirm?.();
      });

      renderSessionDetailGroupOptions({ details: mockRoutineDetails });

      await user.click(screen.getByText("삭제하기"));

      await waitFor(() => {
        expect(
          mockRoutineDetailService.deleteRoutineDetails
        ).toHaveBeenCalledWith(mockRoutineDetails);
        expect(mockRemoveMultipleDetailsInGroup).toHaveBeenCalledWith(
          mockRoutineDetails
        );
      });
    });

    it("단위 버튼 클릭 시 DB 업데이트와 updateMultipleDetailsInGroups를 호출해야 한다", async () => {
      const user = userEvent.setup();
      renderSessionDetailGroupOptions({
        details: [{ ...mockWD, weightUnit: "kg", weight: 100 }],
      });

      const updatedDetail = {
        ...mockWD,
        weightUnit: "lbs",
        weight: 100 * KG_TO_LBS,
      };
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "kg" })).toBeInTheDocument();
      });

      const lbsButton = screen.getByRole("button", { name: "lbs" });
      await user.click(lbsButton);

      await waitFor(() => {
        expect(
          mockWorkoutDetailService.updateLocalWorkoutDetail
        ).toHaveBeenCalledTimes(1);
        expect(
          mockWorkoutDetailService.updateLocalWorkoutDetail
        ).toHaveBeenCalledWith(updatedDetail);

        expect(mockUpdateMultipleDetailsInGroups).toHaveBeenCalledWith([
          updatedDetail,
        ]);
      });
    });

    it("kg 단위에서 lbs로 변경 시 모션 위치가 lbs로 변경되어야 한다", async () => {
      const user = userEvent.setup();
      renderSessionDetailGroupOptions({
        exercise: { ...mockExerciseData, unit: "kg" },
      });

      const motionDiv = screen.getByTestId("motion-unit-selector");
      expect(motionDiv).toHaveAttribute("data-position", "kg");

      const lbsButton = screen.getByRole("button", { name: "lbs" });
      await user.click(lbsButton);

      await waitFor(() => {
        expect(motionDiv).toHaveAttribute("data-position", "lbs");
      });
    });
  });

  describe("에러 처리", () => {
    it("단위 변경 시 에러가 발생하면 showError를 호출해야 한다", async () => {
      const user = userEvent.setup();
      mockWorkoutDetailService.updateLocalWorkoutDetail.mockRejectedValue(
        new Error("DB 에러")
      );

      renderSessionDetailGroupOptions({
        details: [{ ...mockWD, weightUnit: "kg" }],
      });

      const lbsButton = screen.getByRole("button", { name: "lbs" });
      await user.click(lbsButton);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith("단위 변경에 실패했습니다");
      });
    });

    it("워크아웃 삭제 시 에러가 발생하면 showError를 호출해야 한다", async () => {
      const user = userEvent.setup();
      mockWorkoutDetailService.deleteWorkoutDetails.mockRejectedValue(
        new Error("삭제 에러")
      );

      mockOpenModal.mockImplementation(({ onConfirm }) => {
        onConfirm?.();
      });

      renderSessionDetailGroupOptions({ details: mockWorkoutDetails });

      await user.click(screen.getByText("삭제하기"));

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith("운동 삭제에 실패했습니다");
      });
    });

    it("루틴 삭제 시 에러가 발생하면 showError를 호출해야 한다", async () => {
      const user = userEvent.setup();
      mockRoutineDetailService.deleteRoutineDetails.mockRejectedValue(
        new Error("삭제 에러")
      );

      mockOpenModal.mockImplementation(({ onConfirm }) => {
        onConfirm?.();
      });

      renderSessionDetailGroupOptions({ details: mockRoutineDetails });

      await user.click(screen.getByText("삭제하기"));

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith("운동 삭제에 실패했습니다");
      });
    });
  });
});
