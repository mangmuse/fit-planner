import { useSelectedWorkoutGroups } from "@/store/useSelectedWorkoutGroups";
import ExpandedWorkoutGroup from "@/app/(main)/workout/_components/ExpandedWorkoutGroup";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import { WorkoutGroup } from "@/hooks/useLoadDetails";
import { getExerciseWithLocalId } from "@/services/exercise.service";
import {
  getLocalWorkoutDetails,
  getLocalWorkoutDetailsByWorkoutId,
} from "@/services/workoutDetail.service";
import { LocalWorkoutDetail } from "@/types/models";
import { useEffect, useState } from "react";

type ExpandedWorkoutDetailsViewProps = {
  onToggle: () => void;
  workoutId: number;
};
const ExpandedWorkoutDetailsView = ({
  onToggle,
  workoutId,
}: ExpandedWorkoutDetailsViewProps) => {
  const [expandedDetails, setExpandedDetails] = useState<
    {
      exerciseOrder: number;
      details: LocalWorkoutDetail[];
    }[]
  >([]);
  const { selectedGroups, toggleGroup } = useSelectedWorkoutGroups();
  const getIsSelected = (group: {
    exerciseOrder: number;
    details: LocalWorkoutDetail[];
  }) =>
    selectedGroups.some(
      (g) =>
        group.details[0].workoutId === g.workoutId &&
        group.exerciseOrder === g.exerciseOrder
    );

  useEffect(() => {
    (async () => {
      const details = await getLocalWorkoutDetailsByWorkoutId(workoutId);
      const groupedDetails = getGroupedDetails(details);

      setExpandedDetails(groupedDetails);
    })();
  }, [workoutId]);
  return (
    <div className="mt-3">
      {expandedDetails.length > 0 && (
        <ul className="flex flex-col gap-3">
          {expandedDetails.map((group) => (
            <ExpandedWorkoutGroup
              key={group.exerciseOrder}
              isSelected={getIsSelected(group)}
              onToggleSelect={toggleGroup}
              workoutGroup={group}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpandedWorkoutDetailsView;
