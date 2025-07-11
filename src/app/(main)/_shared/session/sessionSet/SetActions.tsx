"use client";

import { useSessionData } from "@/app/(main)/_shared/session/SessionContainer";
import { isWorkoutDetail } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { routineDetailService, workoutDetailService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";

import { LocalRoutineDetail, LocalWorkoutDetail, Saved } from "@/types/models";

export type SetActionsProps = {
  lastValue: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>;
  exerciseOrder: number;
};

const SetActions = ({ lastValue, exerciseOrder }: SetActionsProps) => {
  const { showError } = useModal();
  const {
    reorderExerciseOrderAfterDelete,
    addDetailToGroup,
    removeDetailFromGroup,
  } = useSessionData();
  const handleAddSet = async () => {
    try {
      let newDetail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>;
      if (isWorkoutDetail(lastValue)) {
        newDetail = await workoutDetailService.addSetToWorkout(lastValue);
      } else {
        newDetail = await routineDetailService.addSetToRoutine(lastValue);
      }

      addDetailToGroup(newDetail, lastValue);
    } catch (e) {
      console.error("[SetActions] Error", e);
      showError("세트 추가에 실패했습니다");
    }
  };

  const handleDeleteSet = async () => {
    try {
      const detailId = lastValue.id ?? 0;
      if (isWorkoutDetail(lastValue)) {
        await workoutDetailService.deleteWorkoutDetail(detailId);
      } else {
        await routineDetailService.deleteRoutineDetail(detailId);
      }

      if (lastValue.setOrder === 1) {
        await reorderExerciseOrderAfterDelete(exerciseOrder);
      }
      removeDetailFromGroup(detailId);
    } catch (e) {
      console.error("[SetActions] Error", e);
      showError("세트 삭제에 실패했습니다");
    }
  };
  return (
    <div data-testid="set-actions" className="flex justify-center gap-2.5 mt-2">
      <button
        onClick={handleAddSet}
        className="rounded-md bg-primary text-text-black text-xs flex-1 h-9 font-medium"
      >
        Add Set
      </button>
      <button
        onClick={handleDeleteSet}
        className="rounded-md bg-bg-surface-variant text-text-white text-xs flex-1 h-9 font-medium"
      >
        Delete Set
      </button>
    </div>
  );
};

export default SetActions;
