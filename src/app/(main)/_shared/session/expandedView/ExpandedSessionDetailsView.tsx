import { useSelectedWorkoutGroups } from "@/store/useSelectedWorkoutGroups";
import ExpandedSessionGroup from "@/app/(main)/_shared/session/expandedView/ExpandedSessionGroup";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";

import { LocalWorkoutDetail } from "@/types/models";
import { useEffect, useState } from "react";
import { workoutDetailService } from "@/lib/di";

type ExpandedSessionDetailsViewProps = {
  onToggle: () => void;
  workoutId: number;
};
const ExpandedSessionDetailsView = ({
  onToggle,
  workoutId,
}: ExpandedSessionDetailsViewProps) => {
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
      const details =
        await workoutDetailService.getLocalWorkoutDetailsByWorkoutId(workoutId);
      const groupedDetails = getGroupedDetails(details);

      setExpandedDetails(groupedDetails);
    })();
  }, [workoutId]);
  return (
    <div className="mt-3">
      {expandedDetails.length > 0 && (
        <ul className="flex flex-col gap-3">
          {expandedDetails.map((group) => (
            <ExpandedSessionGroup
              key={group.exerciseOrder}
              isSelected={getIsSelected(group)}
              onToggleSelect={toggleGroup}
              sessionGroup={group}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpandedSessionDetailsView;
