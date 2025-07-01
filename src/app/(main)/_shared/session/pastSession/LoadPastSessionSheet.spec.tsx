import { render, screen, waitFor, act } from "@testing-library/react";
import LoadPastSessionSheet, {
  LoadPastSessionSheetProps,
} from "./LoadPastSessionSheet";
import { useModal } from "@/providers/contexts/ModalContext";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import {
  routineDetailAdapter,
  routineDetailService,
  routineService,
  workoutDetailAdapter,
  workoutDetailService,
  workoutService,
} from "@/lib/di";
import { LocalRoutine, LocalWorkout, LocalWorkoutDetail } from "@/types/models";
import { mockWorkout } from "@/__mocks__/workout.mock";
import PastSessionList from "@/app/(main)/_shared/session/pastSession/PastSessionList";
import { useParams } from "next/navigation";
import {
  SelectedGroupKey,
  useSelectedWorkoutGroups,
} from "@/store/useSelectedWorkoutGroups";
import userEvent from "@testing-library/user-event";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { mockRoutine } from "@/__mocks__/routine.mock";

jest.mock("@/app/(main)/_shared/session/pastSession/PastSessionList", () => {
  return jest.fn(({ pastWorkouts }) => (
    <ul
      data-testid="mock-past-session-list"
      data-prop-count={pastWorkouts.length}
    ></ul>
  ));
});
jest.mock("@/lib/di");
jest.mock("@/providers/contexts/ModalContext");
jest.mock("@/providers/contexts/BottomSheetContext");
jest.mock("next-auth/react");
jest.mock("next/navigation");

const MockedPastSessionList = jest.mocked(PastSessionList);

const mockedUseModal = jest.mocked(useModal);
const mockedUseBottomSheet = jest.mocked(useBottomSheet);
const mockedUseParams = jest.mocked(useParams);

const mockedWorkoutService = jest.mocked(workoutService);
const mockedRoutineService = jest.mocked(routineService);

const mockedWorkoutDetailService = jest.mocked(workoutDetailService);
const mockedRoutineDetailService = jest.mocked(routineDetailService);

const mockW: LocalWorkout = mockWorkout.planned;
const mockR: LocalRoutine = mockRoutine.default;

const mockWorkouts: LocalWorkout[] = [
  { ...mockW, status: "EMPTY", date: "2024-10-02" }, // status 필터링 검사용
  { ...mockW, status: "PLANNED", date: "2024-10-02" },
  { ...mockW, status: "PLANNED", date: "2025-01-01" }, // 날짜 필터링 검사용
];

describe("LoadPastSessionSheet", () => {
  const mockUserId = "user123";
  const mockShowError = jest.fn();
  const mockCloseBottomSheet = jest.fn();
  const mockReload = jest.fn();
  const mockSelectedGroup: SelectedGroupKey[] = [
    { workoutId: 500, exerciseOrder: 1 },
    { workoutId: 500, exerciseOrder: 2 },
  ];
  const mockPastWorkoutDetail1 = { ...mockWorkoutDetail.past, id: 1 };
  const mockPastWorkoutDetail2 = { ...mockWorkoutDetail.past, id: 2 };
  const mockPastWorkoutDetails: LocalWorkoutDetail[] = [
    mockPastWorkoutDetail1,
    mockPastWorkoutDetail2,
  ];

  const initialStoreState = useSelectedWorkoutGroups.getState();

  beforeEach(() => {
    jest.clearAllMocks();

    act(() => {
      useSelectedWorkoutGroups.setState({
        selectedGroups: mockSelectedGroup,
      });
    });

    mockedUseModal.mockReturnValue({
      showError: mockShowError,
      closeModal: jest.fn(),
      openModal: jest.fn(),
      isOpen: false,
    });

    mockedUseBottomSheet.mockReturnValue({
      closeBottomSheet: mockCloseBottomSheet,
      isOpen: false,
      openBottomSheet: jest.fn(),
    });

    mockedUseParams.mockReturnValue({
      date: "2025-01-01",
    });
  });

  afterEach(() => {
    act(() => {
      useSelectedWorkoutGroups.setState(initialStoreState, true);
    });
  });

  const renderComponent = (props: LoadPastSessionSheetProps) => {
    const baseProps = {
      reload: mockReload,
      startExerciseOrder: 5,
    };

    return render(<LoadPastSessionSheet {...baseProps} {...props} />);
  };

  const renderRecordSheet = (
    props: Partial<LoadPastSessionSheetProps> = {}
  ) => {
    const defaultRecordProps: LoadPastSessionSheetProps = {
      type: "RECORD",
      date: "2025-01-01",
      reload: mockReload,
      startExerciseOrder: 5,
    };
    return renderComponent({ ...defaultRecordProps, ...props });
  };
  const renderRoutineSheet = (
    props: Partial<LoadPastSessionSheetProps> = {}
  ) => {
    const defaultRoutineProps: LoadPastSessionSheetProps = {
      type: "ROUTINE",
      routineId: 123,
      reload: mockReload,
      startExerciseOrder: 5,
    };
    return renderComponent({ ...defaultRoutineProps, ...props });
  };

  it("PastSessionList 컴포넌트에 올바른 pastWorkouts 데이터를 전달하며 렌더링한다", async () => {
    mockedWorkoutService.getAllWorkouts.mockResolvedValue(mockWorkouts);

    renderRecordSheet();

    await screen.findByRole("list");

    await waitFor(() => {
      expect(mockedWorkoutService.getAllWorkouts).toHaveBeenCalledWith(
        mockUserId
      );

      const lastCallIndex = MockedPastSessionList.mock.calls.length - 1;
      const props = MockedPastSessionList.mock.calls[lastCallIndex][0];

      expect(props.pastWorkouts).toHaveLength(1);
      expect(props.pastWorkouts[0].status).toBe("PLANNED");

      expect(props.pastWorkouts.some((w) => w.status === "EMPTY")).toBe(false);
    });
  });

  it("선택된 운동이 없는경우 버튼이 비활성화 상태이다", () => {
    act(() => {
      useSelectedWorkoutGroups.setState({
        selectedGroups: [],
      });
    });

    renderRecordSheet();

    const button = screen.getByRole("button", {
      name: "운동을 선택해주세요",
    });

    expect(button).toBeDisabled();
  });

  it("선택된 운동이 있는경우 버튼이 활성화되며, 선택된 운동의 개수가 표시된다", () => {
    renderRecordSheet();

    const button = screen.getByRole("button", {
      name: "선택완료 (2개)",
    });

    expect(button).toBeEnabled();
    expect(button).toHaveTextContent("선택완료 (2개)");
  });

  describe("상호작용", () => {
    const user = userEvent.setup();
    describe("RECORD 타입", () => {
      it("선택된 운동이 있는경우 버튼을 클릭하면 선택된 운동이 추가된다 (RECORD)", async () => {
        mockedWorkoutDetailService.getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs.mockResolvedValue(
          mockPastWorkoutDetails
        );
        mockedWorkoutService.getWorkoutByUserIdAndDate.mockResolvedValue(mockW);
        const mockNewWorkoutDetail1 =
          workoutDetailAdapter.mapPastWorkoutToWorkoutDetail(
            mockPastWorkoutDetail1,
            mockW.id!,
            6
          );
        const mockNewWorkoutDetail2 =
          workoutDetailAdapter.mapPastWorkoutToWorkoutDetail(
            mockPastWorkoutDetail2,
            mockW.id!,
            7
          );

        renderRecordSheet({ startExerciseOrder: 5 });

        const button = screen.getByRole("button", {
          name: "선택완료 (2개)",
        });

        await user.click(button);

        await waitFor(() => {
          expect(
            mockedWorkoutDetailService.addPastWorkoutDetailsToWorkout
          ).toHaveBeenCalledWith([
            mockNewWorkoutDetail1,
            mockNewWorkoutDetail2,
          ]);

          expect(
            mockedRoutineDetailService.addPastWorkoutDetailsToRoutine
          ).not.toHaveBeenCalled();
        });

        expect(mockReload).toHaveBeenCalled();
      });

      it("운동 추가 도중 에러 발생시 에러 모달을 표시한다 (RECORD)", async () => {
        mockedWorkoutDetailService.getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs.mockResolvedValue(
          mockPastWorkoutDetails
        );
        mockedWorkoutDetailService.addPastWorkoutDetailsToWorkout.mockRejectedValue(
          new Error("test")
        );
        mockedWorkoutService.getWorkoutByUserIdAndDate.mockResolvedValue(mockW);

        renderRecordSheet();

        const button = screen.getByRole("button", {
          name: "선택완료 (2개)",
        });

        await user.click(button);

        await waitFor(() => {
          expect(mockShowError).toHaveBeenCalledWith(
            "운동 추가 도중 에러가 발생했습니다"
          );
        });
      });
    });

    describe("ROUTINE 타입", () => {
      it("선택된 운동이 있는경우 버튼을 클릭하면 선택된 운동이 추가된다 (ROUTINE)", async () => {
        const mockRoutine = { ...mockR, id: 123 };

        mockedWorkoutDetailService.getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs.mockResolvedValue(
          mockPastWorkoutDetails
        );
        mockedRoutineService.getRoutineByLocalId.mockResolvedValue(mockRoutine);

        const mockNewRoutineDetail1 =
          routineDetailAdapter.mapPastWorkoutToRoutineDetail(
            mockPastWorkoutDetail1,
            mockRoutine.id!,
            6
          );
        const mockNewRoutineDetail2 =
          routineDetailAdapter.mapPastWorkoutToRoutineDetail(
            mockPastWorkoutDetail2,
            mockRoutine.id!,
            7
          );

        renderRoutineSheet({ routineId: 123, startExerciseOrder: 5 });

        const button = screen.getByRole("button", {
          name: "선택완료 (2개)",
        });

        await user.click(button);

        await waitFor(() => {
          expect(
            mockedRoutineDetailService.addPastWorkoutDetailsToRoutine
          ).toHaveBeenCalledWith([
            mockNewRoutineDetail1,
            mockNewRoutineDetail2,
          ]);

          expect(
            mockedWorkoutDetailService.addPastWorkoutDetailsToWorkout
          ).not.toHaveBeenCalled();
        });

        expect(mockReload).toHaveBeenCalled();
      });

      it("운동 추가 도중 에러 발생시 에러 모달을 표시한다 (ROUTINE)", async () => {
        const mockRoutine = { ...mockR, id: 123 };

        mockedWorkoutDetailService.getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs.mockResolvedValue(
          mockPastWorkoutDetails
        );
        mockedRoutineService.getRoutineByLocalId.mockResolvedValue(mockRoutine);
        mockedRoutineDetailService.addPastWorkoutDetailsToRoutine.mockRejectedValue(
          new Error("test")
        );

        renderRoutineSheet({ routineId: 123 });

        const button = screen.getByRole("button", {
          name: "선택완료 (2개)",
        });

        await user.click(button);

        await waitFor(() => {
          expect(mockShowError).toHaveBeenCalledWith(
            "운동 추가 도중 에러가 발생했습니다"
          );
        });
      });
    });
  });
});
