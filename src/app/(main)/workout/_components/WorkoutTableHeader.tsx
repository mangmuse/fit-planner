import WorkoutCheckbox from "@/app/(main)/workout/_components/WorkoutCheckbox";
import { LocalExercise } from "@/types/models";

type WorkoutTableHeaderProps = {
  exercise: LocalExercise;
};

const WorkoutTableHeader = ({ exercise }: WorkoutTableHeaderProps) => {
  return (
    <thead data-testid="workout-table-header">
      <tr className="h-[22px] text-center text-text-muted">
        <th className="w-[14%] ">Set</th>
        <th className="w-[38%] underline underline-offset-2">Previous</th>
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
