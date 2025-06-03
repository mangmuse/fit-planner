import { useSelectedWokroutDetails } from "@/__mocks__/src/store/useSelectedWorkoutDetails";
import ExpandedWorkoutGroup from "@/app/(main)/workout/_components/ExpandedWorkoutGroup";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import { WorkoutGroup } from "@/hooks/useLoadDetails";
import { getExerciseWithLocalId } from "@/services/exercise.service";
import {
  getLocalWorkoutDetails,
  getLocalWorkoutDetailsByWorkoutId,
} from "@/services/workoutDetail.service";
import { useEffect, useState } from "react";

type ExpandedWorkoutDetailsViewProps = {
  onToggle: () => void;
  workoutId: number;
};
const ExpandedWorkoutDetailsView = ({
  onToggle,
  workoutId,
}: ExpandedWorkoutDetailsViewProps) => {
  const [expandedDetails, setExpandedDetails] = useState<WorkoutGroup[]>([]);
  const { selectedIds, toggleId } = useSelectedWokroutDetails();
  console.log(selectedIds);

  const getIsSelected = (group: WorkoutGroup) =>
    group.details.every((detail) => selectedIds.includes(detail.id ?? 0));

  useEffect(() => {
    (async () => {
      const details = await getLocalWorkoutDetailsByWorkoutId(workoutId);
      const groupedDetails = getGroupedDetails(details);

      setExpandedDetails(groupedDetails);
    })();
  }, [workoutId]);
  return (
    <div className="">
      {expandedDetails.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {expandedDetails.map((group) => (
            <ExpandedWorkoutGroup
              key={group.exerciseOrder}
              isSelected={getIsSelected(group)}
              onToggleSelect={toggleId}
              workoutGroup={group}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpandedWorkoutDetailsView;
