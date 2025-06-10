import ExpandedWorkoutDetailsView from "@/app/(main)/workout/_components/ExpandedWorkoutDetailsView";
import { LocalWorkout } from "@/types/models";
import { useState } from "react";

type PastWorkoutItemProps = {
  workout: LocalWorkout;
};

const PastWorkoutItem = ({ workout }: PastWorkoutItemProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const handleToggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <li
      onClick={handleToggleExpand}
      key={workout.id}
      className="flex bg-bg-surface min-h-20 flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{workout.date}</span>
      </div>
      {isExpanded && (
        <ExpandedWorkoutDetailsView
          onToggle={handleToggleExpand}
          workoutId={workout.id!}
        />
      )}
    </li>
  );
};

export default PastWorkoutItem;
