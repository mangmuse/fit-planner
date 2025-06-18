"use client";

import {
  isWorkoutDetail,
  isWorkoutDetails,
} from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import {
  addSetToRoutine,
  deleteRoutineDetail,
  updateLocalRoutineDetail,
} from "@/services/routineDetail.service";
import { workoutDetailService } from "@/services/workoutDetail.service";
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";

type SetActionsProps = {
  reorderAfterDelete: (deletedExerciseOrder: number) => Promise<void>;
  lastValue: LocalWorkoutDetail | LocalRoutineDetail;
  reload: () => Promise<void>;
};

const SetActions = ({
  lastValue,
  reload,
  reorderAfterDelete,
}: SetActionsProps) => {
  const handleAddSet = async () => {
    if (isWorkoutDetail(lastValue)) {
      await workoutDetailService.addSetToWorkout(lastValue);
    } else {
      await addSetToRoutine(lastValue);
    }
    reload();
  };

  const handleDeleteSet = async () => {
    if (isWorkoutDetail(lastValue)) {
      await workoutDetailService.deleteWorkoutDetail(lastValue.id ?? 0);
    } else {
      await deleteRoutineDetail(lastValue.id ?? 0);
    }
    await reorderAfterDelete(lastValue.exerciseOrder);
    reload();
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
