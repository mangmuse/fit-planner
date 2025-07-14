jest.mock("@/hooks/useLoadDetails");
jest.mock("next-auth/react");
jest.mock("@/providers/contexts/BottomSheetContext");
jest.mock("@/providers/contexts/ModalContext");
jest.mock("@/hooks/useWeightUnitPreference");
jest.mock("next/navigation");
jest.mock("@/lib/di");
jest.mock(
  "@/app/(main)/_shared/session/exerciseGroup/SessionExerciseGroup",
  () => {
    return jest.fn(() => null);
  }
);

import { render } from "@testing-library/react";
import React from "react";
import SessionContainer, {
  SessionData,
  useSessionData,
} from "@/app/(main)/_shared/session/SessionContainer";
import useLoadDetails, { SessionGroup } from "@/hooks/useLoadDetails";
import SessionExerciseGroup from "@/app/(main)/_shared/session/exerciseGroup/SessionExerciseGroup";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { useModal } from "@/providers/contexts/ModalContext";
import { useWeightUnitPreference } from "@/hooks/useWeightUnitPreference";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { mockWorkout } from "@/__mocks__/workout.mock";
import { workoutDetailService, routineDetailService } from "@/lib/di";

const mockedUseLoadDetails = jest.mocked(useLoadDetails);
const mockedSessionExerciseGroup = SessionExerciseGroup as jest.MockedFunction<
  typeof SessionExerciseGroup
>;
const mockedUseModal = jest.mocked(useModal);
const mockedUseBottomSheet = jest.mocked(useBottomSheet);
const mockedUseWeightUnitPreference = jest.mocked(useWeightUnitPreference);
const mockedWorkoutDetailService = jest.mocked(workoutDetailService);
const mockedRoutineDetailService = jest.mocked(routineDetailService);

describe("SessionDataContext", () => {
  const mockWorkoutGroups: SessionGroup[] = [
    {
      exerciseOrder: 1,
      details: [mockWorkoutDetail.past],
    },
  ];
  const mockReload = jest.fn();
  const mockShowError = jest.fn();

  const mockUpdateDetailInGroups = jest.fn();
  const mockUpdateMultipleDetailsInGroups = jest.fn();
  const mockAddDetailToGroup = jest.fn();
  const mockRemoveDetailFromGroup = jest.fn();
  const mockRemoveMultipleDetailsInGroup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseLoadDetails.mockReturnValue({
      error: null,
      isLoading: false,
      workoutGroups: mockWorkoutGroups,
      reload: mockReload,
      workout: mockWorkout.planned,
      setWorkout: jest.fn(),
      updateDetailInGroups: mockUpdateDetailInGroups,
      updateMultipleDetailsInGroups: mockUpdateMultipleDetailsInGroups,
      addDetailToGroup: mockAddDetailToGroup,
      removeDetailFromGroup: mockRemoveDetailFromGroup,
      removeMultipleDetailsInGroup: mockRemoveMultipleDetailsInGroup,
    });

    mockedUseModal.mockReturnValue({
      isOpen: false,
      openModal: jest.fn(),
      showError: mockShowError,
      closeModal: jest.fn(),
    });

    mockedUseBottomSheet.mockReturnValue({
      isOpen: false,
      openBottomSheet: jest.fn(),
      closeBottomSheet: jest.fn(),
    });

    mockedUseWeightUnitPreference.mockReturnValue(["kg", jest.fn()]);
  });

  const renderAndExtractContext = (props = {}): SessionData | null => {
    let contextData: SessionData | null = null;

    mockedSessionExerciseGroup.mockImplementation(() => {
      contextData = useSessionData();
      return null;
    });

    const defaultProps = {
      type: "RECORD" as const,
      date: "2025-07-14",
      formattedDate: "2025년 7월 14일",
    };

    render(<SessionContainer {...defaultProps} {...props} />);

    return contextData;
  };

  it("SessionContainer의 props로 전달받은 type이 RECORD일 때 올바르게 반환해야 한다", () => {
    const contextData = renderAndExtractContext({ type: "RECORD" });

    expect(contextData).not.toBeNull();
    expect(contextData!.type).toBe("RECORD");
  });

  it("SessionContainer의 props로 전달받은 type이 ROUTINE일 때 올바르게 반환해야 한다", () => {
    const contextData = renderAndExtractContext({ type: "ROUTINE" });

    expect(contextData).not.toBeNull();
    expect(contextData!.type).toBe("ROUTINE");
  });

  it("useLoadDetails가 반환한 workoutGroups를 sessionGroups로 반환해야 한다", () => {
    const contextData = renderAndExtractContext();

    expect(contextData).not.toBeNull();
    expect(contextData!.sessionGroup).toEqual(mockWorkoutGroups);
  });

  it("useLoadDetails에서 반환받은 reload 메서드를 그대로 반환해야 한다", () => {
    const contextData = renderAndExtractContext();

    expect(contextData).not.toBeNull();
    expect(contextData!.reload).toBe(mockReload);
  });

  it("useLoadDetails에서 반환받은 모든 상태조작 메서드들을 그대로 반환해야 한다", () => {
    const contextData = renderAndExtractContext();

    expect(contextData).not.toBeNull();
    expect(contextData!.updateDetailInGroups).toBe(mockUpdateDetailInGroups);
    expect(contextData!.updateMultipleDetailsInGroups).toBe(
      mockUpdateMultipleDetailsInGroups
    );
    expect(contextData!.addDetailToGroup).toBe(mockAddDetailToGroup);
    expect(contextData!.removeDetailFromGroup).toBe(mockRemoveDetailFromGroup);
    expect(contextData!.removeMultipleDetailsInGroup).toBe(
      mockRemoveMultipleDetailsInGroup
    );
  });

  describe("reorderExerciseOrderAfterDelete", () => {
    it("RECORD 타입일 때 workoutDetailService.reorderExerciseOrderAfterDelete를 올바른 인자로 호출해야 한다", async () => {
      const contextData = renderAndExtractContext({ type: "RECORD" });

      expect(contextData).not.toBeNull();

      await contextData!.reorderExerciseOrderAfterDelete(2);

      expect(
        mockedWorkoutDetailService.reorderExerciseOrderAfterDelete
      ).toHaveBeenCalledWith(mockWorkout.planned.id, 2);
    });

    it("ROUTINE 타입일 때 routineDetailService.reorderExerciseOrderAfterDelete를 올바른 인자로 호출해야 한다", async () => {
      const contextData = renderAndExtractContext({
        type: "ROUTINE",
        routineId: 456,
      });

      expect(contextData).not.toBeNull();

      await contextData!.reorderExerciseOrderAfterDelete(3);

      expect(
        mockedRoutineDetailService.reorderExerciseOrderAfterDelete
      ).toHaveBeenCalledWith(456, 3);
    });

    it("실패 시 에러 모달을 표시해야 한다", async () => {
      mockedWorkoutDetailService.reorderExerciseOrderAfterDelete.mockRejectedValue(
        new Error("API Error")
      );

      const contextData = renderAndExtractContext({ type: "RECORD" });

      expect(contextData).not.toBeNull();

      await contextData!.reorderExerciseOrderAfterDelete(2);

      expect(mockShowError).toHaveBeenCalledWith(
        "운동 상태를 동기화하는 데 실패했습니다"
      );
    });
  });

  describe("reorderSetOrderAfterDelete", () => {
    it("RECORD 타입일 때 workoutDetailService.reorderSetOrderAfterDelete를 올바른 인자로 호출해야 한다", async () => {
      const mockUpdatedDetails = [mockWorkoutDetail.past];
      mockedWorkoutDetailService.reorderSetOrderAfterDelete.mockResolvedValue(
        mockUpdatedDetails
      );

      const contextData = renderAndExtractContext({ type: "RECORD" });

      expect(contextData).not.toBeNull();

      await contextData!.reorderSetOrderAfterDelete(100, 2);

      expect(
        mockedWorkoutDetailService.reorderSetOrderAfterDelete
      ).toHaveBeenCalledWith(mockWorkout.planned.id, 100, 2);
      expect(mockUpdateMultipleDetailsInGroups).toHaveBeenCalledWith(
        mockUpdatedDetails
      );
    });

    it("ROUTINE 타입일 때 routineDetailService.reorderSetOrderAfterDelete를 올바른 인자로 호출해야 한다", async () => {
      const mockUpdatedDetails = [mockRoutineDetail.past];
      mockedRoutineDetailService.reorderSetOrderAfterDelete.mockResolvedValue(
        mockUpdatedDetails
      );

      const contextData = renderAndExtractContext({
        type: "ROUTINE",
        routineId: 456,
      });

      expect(contextData).not.toBeNull();

      await contextData!.reorderSetOrderAfterDelete(200, 3);

      expect(
        mockedRoutineDetailService.reorderSetOrderAfterDelete
      ).toHaveBeenCalledWith(456, 200, 3);
      expect(mockUpdateMultipleDetailsInGroups).toHaveBeenCalledWith(
        mockUpdatedDetails
      );
    });

    it("실패 시 에러 모달을 표시해야 한다", async () => {
      mockedWorkoutDetailService.reorderSetOrderAfterDelete.mockRejectedValue(
        new Error("API Error")
      );

      const contextData = renderAndExtractContext({ type: "RECORD" });

      expect(contextData).not.toBeNull();

      await contextData!.reorderSetOrderAfterDelete(100, 2);

      expect(mockShowError).toHaveBeenCalledWith(
        "세트 순서 업데이트에 실패했습니다"
      );
    });
  });
});
