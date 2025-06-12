import PrevWorkoutDetails from "@/app/(main)/workout/_components/PrevWorkoutDetails";
import WorkoutCheckbox from "@/app/(main)/workout/_components/WorkoutCheckbox";
import { useModal } from "@/providers/contexts/ModalContext";
import { LocalExercise, LocalWorkoutDetail } from "@/types/models";
import Image from "next/image";
import deletIcon from "public/delete.svg";

type WorkoutTableHeaderProps = {
  exercise: LocalExercise;
  prevDetails: LocalWorkoutDetail[];
  isRoutine?: boolean;
};

const WorkoutTableHeader = ({
  exercise,
  prevDetails,
  isRoutine = false,
}: WorkoutTableHeaderProps) => {
  const { openModal } = useModal();
  const handleDisplayPrevDetailsModal = () => {
    if (prevDetails.length === 0) return;
    openModal({
      type: "generic",

      children: <PrevWorkoutDetails prevDetails={prevDetails} />,
    });
  };
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
              <WorkoutCheckbox />
            )}
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default WorkoutTableHeader;
