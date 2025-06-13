import PrevWorkoutDetails from "@/app/(main)/workout/_components/PrevWorkoutDetails";
import WorkoutCheckbox from "@/app/(main)/workout/_components/WorkoutCheckbox";
import WorkoutSelectAllCheckbox from "@/app/(main)/workout/_components/WorkoutSelectAllCheckbox";
import { isWorkoutDetails } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { useModal } from "@/providers/contexts/ModalContext";
import { updateWorkoutDetails } from "@/services/workoutDetail.service";
import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
} from "@/types/models";
import Image from "next/image";
import deletIcon from "public/delete.svg";
import { useEffect, useState } from "react";

type WorkoutTableHeaderProps = {
  exercise: LocalExercise;
  prevDetails: LocalWorkoutDetail[];
  details: LocalWorkoutDetail[] | LocalRoutineDetail[];
  reload: () => Promise<void>;

  isRoutine?: boolean;
};

const WorkoutTableHeader = ({
  exercise,
  prevDetails,
  details,
  reload,
  isRoutine = false,
}: WorkoutTableHeaderProps) => {
  const { openModal } = useModal();
  const [allDone, setAllDone] = useState<boolean>(false);
  const handleDisplayPrevDetailsModal = () => {
    if (prevDetails.length === 0) return;
    openModal({
      type: "generic",

      children: <PrevWorkoutDetails prevDetails={prevDetails} />,
    });
  };

  useEffect(() => {
    console.log(details);
    const isallDone =
      !isRoutine && details.every((d) => (d as LocalWorkoutDetail).isDone);
    setAllDone(isallDone);
  }, [details]);

  return (
    <thead data-testid="workout-table-header">
      <tr className="h-8 text-center text-text-muted">
        <th className="w-[14%] ">Set</th>
        <th
          onClick={handleDisplayPrevDetailsModal}
          className="w-[38%] underline underline-offset-2"
        >
          Previous
        </th>
        <th className="w-[17%]">{exercise.unit}</th>
        <th className="w-[17%]">Reps</th>
        <th className="w-[14%]">
          <div className="flex justify-center items-center">
            {isRoutine ? (
              <Image src={deletIcon} alt="delete" width={20} height={20} />
            ) : (
              <></>
            )}
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default WorkoutTableHeader;
