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
import {
  addSetToWorkout,
  deleteWorkoutDetail,
  updateLocalWorkoutDetail,
} from "@/services/workoutDetail.service";
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

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
      await addSetToWorkout(lastValue);
    } else {
      await addSetToRoutine(lastValue);
    }
    reload();
  };

  const handleDeleteSet = async () => {
    if (isWorkoutDetail(lastValue)) {
      await deleteWorkoutDetail(lastValue.id ?? 0);
    } else {
      await deleteRoutineDetail(lastValue.id ?? 0);
    }
    console.log("핸들딜릿 실행직전");
    await reorderAfterDelete(lastValue.exerciseOrder);
    reload();
    console.log("핸들딜릿 실행직후");
  };
  return (
    <div data-testid="set-actions" className="flex justify-center gap-2.5 mt-2">
      <button
        onClick={handleAddSet}
        className="rounded-[4px] bg-primary text-text-black text-[10px] w-[46%] h-[28px]"
      >
        Add Set
      </button>
      <button
        onClick={handleDeleteSet}
        className="rounded-[4px] bg-bg-surface-variant text-text-white text-[10px] w-[46%] h-[28px]"
      >
        Delete Set
      </button>
    </div>
  );
};

export default SetActions;
