import ExpandedSessionItem from "@/app/(main)/_shared/session/expandedView/ExpandedSessionItem";
import { exerciseService } from "@/lib/di";
import { LocalWorkoutDetail, Saved } from "@/types/models";
import { useAsync } from "@/hooks/useAsync";
import ErrorState from "@/components/ErrorState";

export type ExpandedWorkoutGroupProps = {
  sessionGroup: {
    exerciseOrder: number;
    details: Saved<LocalWorkoutDetail>[];
  };
  isSelected: boolean;

  onToggleSelect: (workoutId: number, exerciseOrder: number) => void;
};

const ExpandedSessionGroup = ({
  sessionGroup,
  isSelected,
  onToggleSelect,
}: ExpandedWorkoutGroupProps) => {
  const exerciseName = sessionGroup.details[0].exerciseName;

  const handleToggleSelect = () => {
    const workoutId = sessionGroup.details[0].workoutId;
    const exerciseOrder = sessionGroup.exerciseOrder;
    onToggleSelect(workoutId, exerciseOrder);
  };

  return (
    <div className="bg-bg-secondary rounded-lg p-3">
      <div className="flex items-start gap-3">
        <input
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={handleToggleSelect}
          type="checkbox"
          className="mt-1 w-5 h-5 rounded border-2 border-text-muted checked:bg-primary checked:border-primary focus:outline-none"
        />
        <div className="flex-1">
          <h3 className="font-medium text-base mb-2">{exerciseName}</h3>
          <ul className="flex flex-col gap-1">
            {sessionGroup.details.length > 0 &&
              sessionGroup.details.map((detail) => (
                <ExpandedSessionItem key={detail.id} workoutDetail={detail} />
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExpandedSessionGroup;
