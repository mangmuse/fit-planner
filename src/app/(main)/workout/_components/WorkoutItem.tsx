"use client";
import deletIcon from "public/delete.svg";
import SetOrderCell from "@/app/(main)/workout/_components/SetOrderCell";
import WorkoutCheckbox from "@/app/(main)/workout/_components/WorkoutCheckbox";
import { isWorkoutDetail } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import {
  deleteRoutineDetail,
  updateLocalRoutineDetail,
} from "@/services/routineDetail.service";
import { updateLocalWorkoutDetail } from "@/services/workoutDetail.service";
import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
} from "@/types/models";
import Image from "next/image";
import { ChangeEventHandler, useRef, useState } from "react";
import { c } from "node_modules/framer-motion/dist/types.d-6pKw1mTI";

type WorkoutItemProps = {
  exercise: LocalExercise;
  workoutDetail: LocalWorkoutDetail | LocalRoutineDetail;
  reload: () => Promise<void>;
};

const WorkoutItem = ({ workoutDetail, reload, reorder }: WorkoutItemProps) => {
  const { setOrder, weight, reps, id, setType } = workoutDetail;
  console.log(setOrder);
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
    const updateWorkoutInput = {
      ...data,
      id,
    };
    if (isWorkoutDetail(workoutDetail)) {
      await updateLocalWorkoutDetail(updateWorkoutInput);
    } else {
      await updateLocalRoutineDetail(updateWorkoutInput);
    }
    await reload();
  };

  const handleDelete = async () => {
    console.log("hello");
    console.log(!isWorkoutDetail(workoutDetail));
    console.log(workoutDetail.id);
    if (!isWorkoutDetail(workoutDetail) && workoutDetail.id) {
      console.log("zzz");
      await deleteRoutineDetail(workoutDetail.id);

      await reload();
    }
  };

  return (
    <tr data-testid={`workout-detail-item-${id}`} className="h-[22px]">
      <SetOrderCell
        loadLocalWorkoutDetails={reload}
        workoutDetail={workoutDetail}
      />
      <td className="text-center">-</td>
      <td className="text-center">
        <input
          data-testid="weight"
          onChange={handleChangeWeight}
          onBlur={() =>
            weight !== editedWeight && handleUpdate({ weight: editedWeight })
          }
          value={editedWeight ?? 0}
          className="w-[30px] rounded-sm h-3 resize-none bg-transparent outline outline-text-muted text-center"
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
          className="w-[30px] rounded-sm h-3 resize-none bg-transparent outline outline- outline-text-muted text-center"
        />
      </td>
      <td className="text-center  ">
        <div className="flex justify-center items-center">
          {isWorkoutDetail(workoutDetail) ? (
            <WorkoutCheckbox reload={reload} id={id!} prevIsDone={isDone} />
          ) : (
            <button onClick={handleDelete}>
              <Image src={deletIcon} alt="delete" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default WorkoutItem;
