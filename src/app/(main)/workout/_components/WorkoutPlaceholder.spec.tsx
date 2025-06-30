jest.mock("@/lib/di");

jest.mock("@/providers/contexts/BottomSheetContext");
jest.mock("@/providers/contexts/ModalContext");

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock("@/app/(main)/routines/_components/routineList/RoutineList", () => ({
  __esModule: true,
  default: jest.fn(() => <div>RoutineList Mock</div>),
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useParams, usePathname } from "next/navigation";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { useModal } from "@/providers/contexts/ModalContext";
import { mockWorkout } from "@/__mocks__/workout.mock";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import WorkoutPlaceholder from "@/app/(main)/workout/_components/WorkoutPlaceholder";
import {
  routineDetailService,
  workoutService,
  workoutDetailAdapter,
  workoutDetailService,
} from "@/lib/di";

const mockUseParams = jest.mocked(useParams);
const mockUsePathname = jest.mocked(usePathname);
const mockUseBottomSheet = jest.mocked(useBottomSheet);
const mockUseModal = jest.mocked(useModal);

describe("WorkoutPlaceholder", () => {
  const mockReloadDetails = jest.fn();
  let mockOpenBottomSheet: jest.Mock;
  let mockShowError: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOpenBottomSheet = jest.fn();
    mockShowError = jest.fn();

    mockUseBottomSheet.mockReturnValue({
      openBottomSheet: mockOpenBottomSheet,
      closeBottomSheet: jest.fn(),
      isOpen: false,
    });

    mockUseModal.mockReturnValue({
      showError: mockShowError,
      openModal: jest.fn(),
      closeModal: jest.fn(),
      isOpen: false,
    });
  });

  const renderRecordPlaceholder = (
    props: Partial<{
      type: "RECORD";
      date: string;
      userId: string;
      reloadDetails?: () => Promise<void>;
    }> = {}
  ) => {
    const defaultProps = {
      type: "RECORD" as const,
      userId: "1",
      date: "2024-01-01",
      reloadDetails: mockReloadDetails,
    };
    const mergedProps = { ...defaultProps, ...props };
    mockUseParams.mockReturnValue({ routineId: undefined });
    mockUsePathname.mockReturnValue(`/workout/${mergedProps.date}`);

    render(<WorkoutPlaceholder {...mergedProps} />);
  };

  const renderRoutinePlaceholder = (
    props: Partial<{
      type: "ROUTINE";
      reloadDetails?: () => Promise<void>;
    }> = {}
  ) => {
    const defaultProps = {
      type: "ROUTINE" as const,
      reloadDetails: mockReloadDetails,
    };
    const mergedProps = { ...defaultProps, ...props };

    render(<WorkoutPlaceholder {...mergedProps} />);
  };

  it("type이 RECORD인경우 기본 버튼들이 표시된다", () => {
    renderRecordPlaceholder();

    expect(screen.getByText("나의 루틴 가져오기")).toBeInTheDocument();
    expect(screen.getByText("운동 추가하기")).toBeInTheDocument();
  });

  it("type이 ROUTINE인경우 기본 버튼들이 표시된다", () => {
    mockUseParams.mockReturnValue({ routineId: "123" });
    mockUsePathname.mockReturnValue("/routines/123");
    renderRoutinePlaceholder();

    expect(screen.getByText("나의 루틴 가져오기")).toBeInTheDocument();
    expect(screen.getByText("운동 추가하기")).toBeInTheDocument();
  });

  it("'운동 추가하기' 링크의 경로가 type에 따라 올바르게 설정된다 (RECORD)", () => {
    renderRecordPlaceholder();
    const link = screen.getByRole("link", { name: "운동 추가하기" });
    expect(link).toHaveAttribute("href", "/workout/2024-01-01/exercises");
  });

  it("'운동 추가하기' 링크의 경로가 type에 따라 올바르게 설정된다 (ROUTINE)", () => {
    mockUseParams.mockReturnValue({ routineId: "123" });
    mockUsePathname.mockReturnValue("/routines/123");
    renderRoutinePlaceholder();
    const link = screen.getByRole("link", { name: "운동 추가하기" });
    expect(link).toHaveAttribute("href", `/routines/123/exercises`);
  });

  it("'나의 루틴 가져오기' 버튼 클릭시 바텀시트가 열려야한다", async () => {
    renderRecordPlaceholder();

    const openRoutineButton = screen.getByRole("button", {
      name: "나의 루틴 가져오기",
    });

    await userEvent.click(openRoutineButton);

    expect(mockOpenBottomSheet).toHaveBeenCalledWith({
      height: "100dvh",
      children: expect.any(Object),
    });
    expect(mockOpenBottomSheet).toHaveBeenCalledTimes(1);
  });

  it("'RECORD' 타입일 때 루틴 선택 시 workout 관련 서비스들이 호출된다", async () => {
    const mockRoutineDetails = [mockRoutineDetail.past];
    const mockW = mockWorkout.planned;

    jest
      .mocked(routineDetailService.getLocalRoutineDetails)
      .mockResolvedValue(mockRoutineDetails);
    jest
      .mocked(workoutService.getWorkoutByUserIdAndDate)
      .mockResolvedValue(mockW);

    renderRecordPlaceholder();

    await userEvent.click(screen.getByText("나의 루틴 가져오기"));

    const { children } = mockOpenBottomSheet.mock.calls[0][0];
    const onPick = children.props.onPick;

    await onPick(123);

    expect(routineDetailService.getLocalRoutineDetails).toHaveBeenCalledWith(
      123
    );
    expect(mockReloadDetails).toHaveBeenCalledTimes(1);
    expect(
      workoutDetailAdapter.convertRoutineDetailToWorkoutDetailInput
    ).toHaveBeenCalledWith(mockRoutineDetail.past, mockW.id);
    expect(workoutDetailService.addLocalWorkoutDetail).toHaveBeenCalledTimes(1);

    expect(
      routineDetailService.cloneRoutineDetailWithNewRoutineId
    ).not.toHaveBeenCalled();
  });

  it("'ROUTINE' 타입일 때 루틴 선택 시 routine 관련 서비스들이 호출된다", async () => {
    const mockRoutineDetails = [mockRoutineDetail.past];

    jest
      .mocked(routineDetailService.getLocalRoutineDetails)
      .mockResolvedValue(mockRoutineDetails);

    mockUseParams.mockReturnValue({ routineId: "123" });
    mockUsePathname.mockReturnValue("/routines/123");
    renderRoutinePlaceholder();

    await userEvent.click(screen.getByText("나의 루틴 가져오기"));

    const { children } = mockOpenBottomSheet.mock.calls[0][0];
    const onPick = children.props.onPick;

    await onPick(456);

    expect(mockReloadDetails).toHaveBeenCalledTimes(1);
    expect(routineDetailService.getLocalRoutineDetails).toHaveBeenCalledWith(
      456
    );
    expect(
      routineDetailService.cloneRoutineDetailWithNewRoutineId
    ).toHaveBeenCalledWith(mockRoutineDetail.past, 123);

    expect(
      workoutDetailAdapter.convertRoutineDetailToWorkoutDetailInput
    ).not.toHaveBeenCalled();
    expect(workoutDetailService.addLocalWorkoutDetail).not.toHaveBeenCalled();
  });

  it("'RECORD' 타입일 때 루틴 가져오기에 실패하면 에러 모달이 표시된다", async () => {
    const mockError = new Error("루틴 가져오기에 실패했습니다.");
    jest
      .mocked(routineDetailService.getLocalRoutineDetails)
      .mockRejectedValue(mockError);

    renderRecordPlaceholder();

    await userEvent.click(screen.getByText("나의 루틴 가져오기"));

    const { children } = mockOpenBottomSheet.mock.calls[0][0];
    const onPick = children.props.onPick;

    await onPick(123);

    expect(mockShowError).toHaveBeenCalledWith("루틴 가져오기에 실패했습니다.");
  });
});
