import WorkoutCheckbox from "@/app/(main)/workout/_components/WorkoutCheckbox";
import { updateLocalWorkoutDetail } from "@/services/workoutDetail.service";
import { ClientWorkoutDetail, LocalWorkoutDetail } from "@/types/models";
import { ChangeEventHandler, useRef, useState } from "react";

type WorkoutItemProps = {
  workoutDetail: LocalWorkoutDetail;
  loadLocalWorkoutDetails: () => Promise<void>;
};

const WorkoutItem = ({
  workoutDetail,
  loadLocalWorkoutDetails,
}: WorkoutItemProps) => {
  const { setOrder, weight, reps, isDone, id } = workoutDetail;
  const [editedWeight, setEditedWeight] = useState<number | null>(
    weight || null
  );
  const [editedReps, setEditedReps] = useState<number | null>(reps || null);

  const handleChangeWeight: ChangeEventHandler<HTMLInputElement> = (e) =>
    setEditedWeight(e.target.value ? ~~e.target.value : null);
  const handleChangeReps: ChangeEventHandler<HTMLInputElement> = (e) =>
    setEditedReps(e.target.value ? ~~e.target.value : null);

  const handleUpdate = async (data: Partial<LocalWorkoutDetail>) => {
    const updateWorkoutInput = {
      ...data,
      id,
    };
    await updateLocalWorkoutDetail(updateWorkoutInput);
    loadLocalWorkoutDetails();
  };
  return (
    <tr className="h-[22px]">
      <td className="text-center">{setOrder}</td>
      <td className="text-center">-</td>
      <td className="text-center">
        <input
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
          <WorkoutCheckbox
            loadLocalWorkoutDetails={loadLocalWorkoutDetails}
            id={id!}
            prevIsDone={isDone}
          />
        </div>
        {setOrder}
      </td>
    </tr>
  );
};

export default WorkoutItem;
