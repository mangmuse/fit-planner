"use client";
import SessionCheckbox from "@/app/(main)/_shared/session/sessionSet/SessionCheckbox";
import { isWorkoutDetail } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
  Saved,
} from "@/types/models";
import { Trash2 } from "lucide-react";
import { ChangeEventHandler, useState, useEffect } from "react";
import SetOrderCell from "@/app/(main)/_shared/session/sessionSet/SetOrderCell";
import { routineDetailService, workoutDetailService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { formatWeight, parseWeightInput } from "@/util/weightConversion";
import { useSessionData } from "@/app/(main)/_shared/session/SessionContainer";
import { SessionGroup } from "@/hooks/useLoadDetails";

export type SessionItemProps = {
  detail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>;
  prevWorkoutDetail?: Saved<LocalWorkoutDetail>;
  group: SessionGroup;
  isLastSet: boolean;
};

const SessionItem = ({
  detail,
  prevWorkoutDetail,
  group,
  isLastSet,
}: SessionItemProps) => {
  const {
    updateDetailInGroups,
    removeDetailFromGroup,
    reorderSetOrderAfterDelete,
    reorderExerciseOrderAfterDelete,
    reload,
    sessionGroup,
  } = useSessionData();
  const { weight, reps, id } = detail;
  const { showError } = useModal();
  const isDone = isWorkoutDetail(detail) ? detail.isDone : false;
  const [editedWeight, setEditedWeight] = useState<number | null>(
    weight || null
  );
  const [editedReps, setEditedReps] = useState<number | null>(reps || null);

  useEffect(() => {
    setEditedWeight(weight || null);
  }, [weight]);

  useEffect(() => {
    setEditedReps(reps || null);
  }, [reps]);

  const handleChangeWeight: ChangeEventHandler<HTMLInputElement> = (e) => {
    const weightUnit = detail.weightUnit || "kg";
    const parsedWeight = parseWeightInput(e.target.value, weightUnit);
    setEditedWeight(parsedWeight);
  };
  const handleChangeReps: ChangeEventHandler<HTMLInputElement> = (e) =>
    setEditedReps(e.target.value ? ~~e.target.value : null);

  const handleUpdate = async (
    data: Partial<LocalWorkoutDetail | LocalRoutineDetail>
  ) => {
    try {
      const updateWorkoutInput = {
        ...detail,
        ...data,
      };
      if (isWorkoutDetail(detail)) {
        await workoutDetailService.updateLocalWorkoutDetail(updateWorkoutInput);
      } else {
        await routineDetailService.updateLocalRoutineDetail(updateWorkoutInput);
      }
      updateDetailInGroups(updateWorkoutInput);
    } catch (e) {
      console.error("[SessionItem] Error", e);
      showError("운동 상태 업데이트에 실패했습니다");
    }
  };

  const handleDelete = async () => {
    if (!isWorkoutDetail(detail) && detail.id) {
      try {
        await routineDetailService.deleteRoutineDetail(detail.id);

        if (isLastSet) {
          await reorderExerciseOrderAfterDelete(group.exerciseOrder);
        } else {
          await reorderSetOrderAfterDelete(detail.exerciseId, detail.setOrder);
        }

        removeDetailFromGroup?.(detail.id);
      } catch (e) {
        console.error("[SessionItem] Error", e);
        showError("운동 삭제에 실패했습니다");
      }
    }
  };

  return (
    <tr data-testid={`session-item`} className="h-9">
      <SetOrderCell loadLocalWorkoutDetails={reload} workoutDetail={detail} />
      <td data-testid="prev-record" className="text-center">
        {prevWorkoutDetail
          ? `${formatWeight(
              prevWorkoutDetail.weight || 0,
              prevWorkoutDetail.weightUnit || "kg"
            )} x ${prevWorkoutDetail.reps} 회`
          : "-"}
      </td>
      <td className="text-center">
        <input
          data-testid="weight"
          type="number"
          step={detail.weightUnit === "kg" ? "0.01" : "1"}
          min="0"
          onChange={handleChangeWeight}
          onBlur={() =>
            weight !== editedWeight && handleUpdate({ weight: editedWeight })
          }
          value={editedWeight ?? ""}
          placeholder="0"
          className="w-9 h-5 rounded bg-transparent outline outline-1 outline-text-muted text-center focus:outline-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </td>

      <td className="text-center">
        <input
          data-testid="reps"
          type="number"
          min="0"
          onChange={handleChangeReps}
          onBlur={() =>
            reps !== editedReps && handleUpdate({ reps: editedReps })
          }
          value={editedReps ?? ""}
          placeholder="0"
          className="w-9 h-5 rounded bg-transparent outline outline-1 outline-text-muted text-center focus:outline-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </td>
      <td className="text-center  ">
        <div className="flex justify-center items-center">
          {isWorkoutDetail(detail) ? (
            <SessionCheckbox
              prevIsDone={isDone}
              updateDetailInGroups={updateDetailInGroups}
              detail={detail}
            />
          ) : (
            <button onClick={handleDelete} aria-label="삭제">
              <Trash2 className="w-5 h-5 text-warning" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default SessionItem;
