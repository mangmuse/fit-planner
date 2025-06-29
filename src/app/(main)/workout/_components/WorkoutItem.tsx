"use client";
import deletIcon from "public/delete.svg";
import WorkoutCheckbox from "@/app/(main)/workout/_components/WorkoutCheckbox";
import { isWorkoutDetail } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
} from "@/types/models";
import Image from "next/image";
import { ChangeEventHandler, useState } from "react";
import SetOrderCell from "@/app/(main)/workout/_components/SetOrderCell";
import { routineDetailService, workoutDetailService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";

type WorkoutItemProps = {
  exercise: LocalExercise;
  workoutDetail: LocalWorkoutDetail | LocalRoutineDetail;
  prevWorkoutDetail?: LocalWorkoutDetail;
  reorderAfterDelete: (deletedExerciseOrder: number) => Promise<void>;

  reload: () => Promise<void>;
};

const WorkoutItem = ({
  workoutDetail,
  exercise,
  prevWorkoutDetail,
  reload,
  reorderAfterDelete,
}: WorkoutItemProps) => {
  const { weight, reps, id } = workoutDetail;
  const { showError } = useModal();
  const isDone = isWorkoutDetail(workoutDetail) ? workoutDetail.isDone : false;
  const [editedWeight, setEditedWeight] = useState<number | null>(
    weight || null
  );
  const [editedReps, setEditedReps] = useState<number | null>(reps || null);

  const handleChangeWeight: ChangeEventHandler<HTMLInputElement> = (e) =>
    setEditedWeight(e.target.value ? ~~e.target.value : null);
  const handleChangeReps: ChangeEventHandler<HTMLInputElement> = (e) =>
    setEditedReps(e.target.value ? ~~e.target.value : null);

  const handleUpdate = async (
    data: Partial<LocalWorkoutDetail | LocalRoutineDetail>
  ) => {
    try {
      const updateWorkoutInput = {
        ...data,
        id,
      };
      if (isWorkoutDetail(workoutDetail)) {
        await workoutDetailService.updateLocalWorkoutDetail(updateWorkoutInput);
      } else {
        await routineDetailService.updateLocalRoutineDetail(updateWorkoutInput);
      }
      await reload();
    } catch (e) {
      console.error("[WorkoutItem] Error", e);
      showError("운동 상태를 동기화하는데 실패했습니다");
    }
  };

  const handleDelete = async () => {
    if (!isWorkoutDetail(workoutDetail) && workoutDetail.id) {
      try {
        await routineDetailService.deleteRoutineDetail(workoutDetail.id);
        await reorderAfterDelete(workoutDetail.exerciseOrder);
        await reload();
      } catch (e) {
        console.error("[WorkoutItem] Error", e);
        showError("운동 상태를 동기화하는데 실패했습니다");
      }
    }
  };

  return (
    <tr data-testid={`workout-detail-item-${id}`} className="h-9">
      <SetOrderCell
        loadLocalWorkoutDetails={reload}
        workoutDetail={workoutDetail}
      />
      <td className="text-center">
        {prevWorkoutDetail
          ? `${prevWorkoutDetail.weight} ${exercise.unit || "kg"} x ${
              prevWorkoutDetail.reps
            } 회`
          : "-"}
      </td>
      <td className="text-center">
        <input
          data-testid="weight"
          onChange={handleChangeWeight}
          onBlur={() =>
            weight !== editedWeight && handleUpdate({ weight: editedWeight })
          }
          value={editedWeight ?? 0}
          className="w-9 h-5 rounded bg-transparent outline outline-1 outline-text-muted text-center focus:outline-primary"
        />
      </td>
      <td className="text-center">
        <input
          data-testid="reps"
          onChange={handleChangeReps}
          onBlur={() =>
            reps !== editedReps && handleUpdate({ reps: editedReps })
          }
          value={editedReps ?? 0}
          className="w-9 h-5 rounded bg-transparent outline outline-1 outline-text-muted text-center focus:outline-primary"
        />
      </td>
      <td className="text-center  ">
        <div className="flex justify-center items-center">
          {isWorkoutDetail(workoutDetail) ? (
            <WorkoutCheckbox reload={reload} id={id!} prevIsDone={isDone} />
          ) : (
            <button onClick={handleDelete}>
              <Image src={deletIcon} alt="delete" width={20} height={20} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default WorkoutItem;
