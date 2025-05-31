import PrevWorkoutDetails from "@/app/(main)/workout/_components/PrevWorkoutDetails";
import WorkoutCheckbox from "@/app/(main)/workout/_components/WorkoutCheckbox";
import { useModal } from "@/providers/contexts/ModalContext";
import { LocalExercise, LocalWorkoutDetail } from "@/types/models";

type WorkoutTableHeaderProps = {
  exercise: LocalExercise;
  prevDetails: LocalWorkoutDetail[];
};

const WorkoutTableHeader = ({
  exercise,
  prevDetails,
}: WorkoutTableHeaderProps) => {
  const { openModal } = useModal();
  const handleDisplayPrevDetailsModal = () => {
    if (prevDetails.length < 0) return;
    openModal({
      type: "generic",

      children: <PrevWorkoutDetails prevDetails={prevDetails} />,
    });
  };
  return (
    <thead data-testid="workout-table-header">
      <tr className="h-[22px] text-center text-text-muted">
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
            <WorkoutCheckbox />
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default WorkoutTableHeader;
