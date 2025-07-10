import { mockExercise } from "@/__mocks__/exercise.mock";
import { mockWorkoutDetailService } from "@/__mocks__/lib/di";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import SessionExerciseGroup, {
  SessionExerciseGroupProps,
} from "@/app/(main)/_shared/session/exerciseGroup/SessionExerciseGroup";
import {
  exerciseService,
  routineDetailService,
  workoutDetailService,
} from "@/lib/di";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { useModal } from "@/providers/contexts/ModalContext";
import { LocalExercise, Saved } from "@/types/models";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";

jest.mock("@/lib/di");
jest.mock("@/providers/contexts/BottomSheetContext");
jest.mock("@/providers/contexts/ModalContext");
jest.mock("@/app/(main)/workout/_utils/getGroupedDetails");

const mockedExerciseService = jest.mocked(exerciseService);
const mockedWorkoutDetailService = jest.mocked(workoutDetailService);
const mockedRoutineDetailService = jest.mocked(routineDetailService);
const mockedUseModal = jest.mocked(useModal);
const mockedUseBottomSheet = jest.mocked(useBottomSheet);
const mockedGetGroupedDetails = jest.mocked(getGroupedDetails);

const mockEx: Saved<LocalExercise> = {
  ...mockExercise.bookmarked,
  id: 123,
  name: "굿모닝",
  unit: "lbs",
};

const mockExerciseOrder = 5;
const mockWDs = [
  {
    ...mockWorkoutDetail.past,
    exerciseName: "굿모닝",
    exerciseOrder: mockExerciseOrder,
    setType: "NORMAL" as const,
    weight: 100,
    reps: 10,
    rpe: null,
    isDone: true,
    setOrder: 1,
    weightUnit: "lbs" as const,
  },
  {
    ...mockWorkoutDetail.past,
    exerciseName: "굿모닝",
    exerciseOrder: mockExerciseOrder,
    setType: "NORMAL" as const,
    weight: 60,
    reps: 5,
    rpe: null,
    isDone: true,
    setOrder: 2,
    weightUnit: "lbs" as const,
  },
  {
    ...mockWorkoutDetail.past,
    exerciseName: "굿모닝",
    exerciseOrder: mockExerciseOrder,
    setType: "NORMAL" as const,
    weight: 60,
    reps: 5,
    rpe: null,
    isDone: true,
    setOrder: 3,
    weightUnit: "lbs" as const,
  },
];

const mockRDs = [
  {
    ...mockRoutineDetail.past,
    exerciseName: "굿모닝",
    exerciseOrder: mockExerciseOrder,
    setType: "NORMAL" as const,
    weight: 100,
    reps: 10,
    rpe: null,
    setOrder: 1,
  },
  {
    ...mockRoutineDetail.past,
    exerciseName: "굿모닝",
    exerciseOrder: mockExerciseOrder,
    setType: "NORMAL" as const,
    weight: 60,
    reps: 5,
    rpe: null,
    setOrder: 2,
  },
  {
    ...mockRoutineDetail.past,
    exerciseName: "굿모닝",
    exerciseOrder: mockExerciseOrder,
    setType: "NORMAL" as const,
    weight: 60,
    reps: 5,
    rpe: null,
    setOrder: 3,
  },
];

describe("SessionExerciseGroup", () => {
  const mockOpenBottomSheet = jest.fn();
  const mockShowError = jest.fn();
  const mockReload = jest.fn();
  const mockReorderAfterDelete = jest.fn();

  const mockAddDetailToGroup = jest.fn();
  const mockUpdateDetailInGroups = jest.fn();
  const mockRemoveDetailFromGroup = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseBottomSheet.mockReturnValue({
      openBottomSheet: mockOpenBottomSheet,
      closeBottomSheet: jest.fn(),
      isOpen: false,
    });

    mockedUseModal.mockReturnValue({
      showError: mockShowError,
      closeModal: jest.fn(),
      isOpen: false,
      openModal: jest.fn(),
    });

    mockedExerciseService.getExerciseWithLocalId.mockResolvedValue(mockEx);
    mockedWorkoutDetailService.getLatestWorkoutDetailByDetail.mockResolvedValue(
      mockWDs[0]
    );
    mockedWorkoutDetailService.getWorkoutGroupByWorkoutDetail.mockResolvedValue(
      mockWDs
    );
    mockedWorkoutDetailService.getLocalWorkoutDetailsByWorkoutIdAndExerciseId.mockResolvedValue(
      mockWDs
    );
    mockedGetGroupedDetails.mockReturnValue([
      {
        exerciseOrder: mockExerciseOrder,
        details: mockWDs,
      },
    ]);
  });
  const renderSessionExerciseGroup = (
    props?: Partial<SessionExerciseGroupProps>
  ) => {
    const defaultProps: SessionExerciseGroupProps = {
      details: mockWDs,
      exerciseOrder: mockExerciseOrder,
      reload: mockReload,
      reorderAfterDelete: mockReorderAfterDelete,
      occurrence: 1,
      updateDetailInGroups: jest.fn(),
      updateMultipleDetailsInGroups: jest.fn(),
      removeDetailFromGroup: mockRemoveDetailFromGroup,
      addDetailToGroup: mockAddDetailToGroup,
    };
    render(<SessionExerciseGroup {...defaultProps} {...props} />);
  };
  describe("렌더링", () => {
    describe("workout", () => {
      it("exerciseOrder와, 운동이름을 올바르게 렌더링해야 한다", async () => {
        renderSessionExerciseGroup();

        await waitFor(() => {
          const exerciseOrder = screen.getByTestId("exercise-order");
          const exerciseName = screen.getByText(mockWDs[0].exerciseName);
          expect(exerciseOrder).toHaveTextContent(mockExerciseOrder.toString());
          expect(exerciseName).toBeInTheDocument();
        });
      });

      it("workoutDetail의 경우 delete 아이콘이 렌더링되지 않는다", async () => {
        renderSessionExerciseGroup();

        await waitFor(() => {
          expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
        });

        const deleteIcon = screen.queryAllByRole("button", { name: "삭제" });
        expect(deleteIcon).toHaveLength(0);
      });

      it("detail의 개수만큼 아이템이 렌더링된다", async () => {
        renderSessionExerciseGroup();

        await waitFor(() => {
          expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
        });

        const items = screen.getAllByTestId("session-item");
        expect(items).toHaveLength(mockWDs.length);
      });

      it("detail의 값이 올바르게 렌더링된다", async () => {
        renderSessionExerciseGroup();

        await waitFor(() => {
          expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
        });

        const items = screen.getAllByTestId("session-item");
        const firstItem = items[0];

        const setOrder = within(firstItem).getByTestId("set-order");
        const prevRecord = within(firstItem).getByTestId("prev-record");
        const weight = within(firstItem).getByTestId("weight");
        const reps = within(firstItem).getByTestId("reps");

        expect(setOrder).toHaveTextContent(mockWDs[0].setOrder.toString());
        expect(prevRecord).toHaveTextContent(
          `${mockWDs[0].weight} ${mockWDs[0].weightUnit} x ${mockWDs[0].reps} 회`
        );
        expect(weight).toHaveValue(mockWDs[0].weight);
        expect(reps).toHaveValue(mockWDs[0].reps);

        const checkbox = within(firstItem).getByRole("checkbox");
        expect(checkbox).toBeChecked();
      });
    });

    describe("routine", () => {
      it("체크박스가 렌더링되지 않는다", async () => {
        renderSessionExerciseGroup({ details: mockRDs });

        await waitFor(() => {
          expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
        });

        const checkboxes = screen.queryAllByRole("checkbox");
        expect(checkboxes).toHaveLength(0);
      });

      it("delete 아이콘이 렌더링된다", async () => {
        renderSessionExerciseGroup({ details: mockRDs });

        await waitFor(() => {
          expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole("button", { name: "삭제" });
        expect(deleteButtons).toHaveLength(mockRDs.length);
      });
    });
  });

  describe("상호작용", () => {
    const user = userEvent.setup();
    it("메뉴 버튼을 클릭하면 바텀시트가 열린다", async () => {
      renderSessionExerciseGroup();

      await waitFor(() => {
        expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
      });

      const menuButton = screen.getByRole("button", { name: "운동 메뉴" });
      await user.click(menuButton);

      expect(mockOpenBottomSheet).toHaveBeenCalledWith(
        expect.objectContaining({
          minHeight: 300,
          children: expect.any(Object),
        })
      );
      const { children } = mockOpenBottomSheet.mock.calls[0][0];
      expect(children.type.name).toBe("SessionDetailGroupOptions");
      expect(children.props).toEqual(
        expect.objectContaining({
          reload: expect.any(Function),
          reorderAfterDelete: expect.any(Function),
          loadExercises: expect.any(Function),
          details: mockWDs,
          exercise: mockEx,
        })
      );
    });

    describe("workout", () => {
      mockWorkoutDetailService.addSetToWorkout.mockResolvedValue({
        ...mockWDs[mockWDs.length - 1],
        id: 55,
      });
      it("Add Set 버튼을 클릭하면 세트가 추가된다", async () => {
        renderSessionExerciseGroup();

        await waitFor(() => {
          expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
        });

        const addSetBtn = screen.getByRole("button", { name: "Add Set" });
        await user.click(addSetBtn);

        expect(mockWorkoutDetailService.addSetToWorkout).toHaveBeenCalledWith(
          mockWDs[mockWDs.length - 1]
        );
        expect(mockAddDetailToGroup).toHaveBeenCalledWith(
          {
            ...mockWDs[mockWDs.length - 1],
            id: 55,
          },
          mockWDs[mockWDs.length - 1]
        );

        expect(
          mockedRoutineDetailService.addSetToRoutine
        ).not.toHaveBeenCalled();
      });

      it("Delete Set 버튼을 클릭하면 마지막세트가 삭제된다", async () => {
        renderSessionExerciseGroup();

        await waitFor(() => {
          expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
        });

        const deleteSetBtn = screen.getByRole("button", { name: "Delete Set" });
        await user.click(deleteSetBtn);

        expect(
          mockWorkoutDetailService.deleteWorkoutDetail
        ).toHaveBeenCalledWith(mockWDs[mockWDs.length - 1].id);

        expect(mockRemoveDetailFromGroup).toHaveBeenCalledWith(
          mockWDs[mockWDs.length - 1].id
        );

        expect(
          mockedRoutineDetailService.deleteRoutineDetail
        ).not.toHaveBeenCalled();
      });

      it("세트 추가를 실패하면 에러 모달이 렌더링된다", async () => {
        const mockError = new Error("추가실패");
        mockedWorkoutDetailService.addSetToWorkout.mockRejectedValue(mockError);
        renderSessionExerciseGroup();

        await waitFor(() => {
          expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
        });

        const addSetBtn = screen.getByRole("button", { name: "Add Set" });
        await user.click(addSetBtn);

        expect(mockShowError).toHaveBeenCalledWith("세트 추가에 실패했습니다");
      });

      it("세트 삭제에 실패하면 에러 모달이 렌더링된다", async () => {
        const mockError = new Error("삭제실패");
        mockedWorkoutDetailService.deleteWorkoutDetail.mockRejectedValue(
          mockError
        );
        renderSessionExerciseGroup();

        await waitFor(() => {
          expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
        });

        const deleteSetBtn = screen.getByRole("button", { name: "Delete Set" });
        await user.click(deleteSetBtn);

        expect(mockShowError).toHaveBeenCalledWith("세트 삭제에 실패했습니다");
      });

      //
    });

    describe("routine", () => {
      beforeEach(() => {
        mockedRoutineDetailService.addSetToRoutine.mockResolvedValue({
          ...mockRDs[mockRDs.length - 1],
          id: 66,
        });
      });

      it("Add Set 버튼을 클릭하면 세트가 추가된다", async () => {
        renderSessionExerciseGroup({ details: mockRDs });

        await waitFor(() => {
          expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
        });

        const addSetBtn = screen.getByRole("button", { name: "Add Set" });
        await user.click(addSetBtn);

        expect(mockedRoutineDetailService.addSetToRoutine).toHaveBeenCalledWith(
          mockRDs[mockRDs.length - 1]
        );
        expect(mockAddDetailToGroup).toHaveBeenCalledWith(
          {
            ...mockRDs[mockRDs.length - 1],
            id: 66,
          },
          mockRDs[mockRDs.length - 1]
        );

        expect(mockWorkoutDetailService.addSetToWorkout).not.toHaveBeenCalled();
      });

      it("Delete Set 버튼을 클릭하면 마지막세트가 삭제된다", async () => {
        renderSessionExerciseGroup({ details: mockRDs });

        await waitFor(() => {
          expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
        });

        const deleteSetBtn = screen.getByRole("button", { name: "Delete Set" });
        await user.click(deleteSetBtn);

        expect(
          mockedRoutineDetailService.deleteRoutineDetail
        ).toHaveBeenCalledWith(mockRDs[mockRDs.length - 1].id);
        expect(mockRemoveDetailFromGroup).toHaveBeenCalledWith(
          mockRDs[mockRDs.length - 1].id
        );
        expect(
          mockWorkoutDetailService.deleteWorkoutDetail
        ).not.toHaveBeenCalled();
      });

      it("세트 추가를 실패하면 에러 모달이 렌더링된다", async () => {
        const mockError = new Error("추가실패");
        mockedRoutineDetailService.addSetToRoutine.mockRejectedValue(mockError);
        renderSessionExerciseGroup({ details: mockRDs });

        await waitFor(() => {
          expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
        });

        const addSetBtn = screen.getByRole("button", { name: "Add Set" });
        await user.click(addSetBtn);

        expect(mockShowError).toHaveBeenCalledWith("세트 추가에 실패했습니다");
      });

      it("세트 삭제에 실패하면 에러 모달이 렌더링된다", async () => {
        const mockError = new Error("삭제실패");
        mockedRoutineDetailService.deleteRoutineDetail.mockRejectedValue(
          mockError
        );
        renderSessionExerciseGroup({ details: mockRDs });

        await waitFor(() => {
          expect(screen.getByTestId("exercise-order")).toBeInTheDocument();
        });

        const deleteSetBtn = screen.getByRole("button", { name: "Delete Set" });
        await user.click(deleteSetBtn);

        expect(mockShowError).toHaveBeenCalledWith("세트 삭제에 실패했습니다");
      });
    });
  });
});
