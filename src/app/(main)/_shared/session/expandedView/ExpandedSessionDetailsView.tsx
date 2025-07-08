import { useSelectedWorkoutGroups } from "@/store/useSelectedWorkoutGroups";
import ExpandedSessionGroup from "@/app/(main)/_shared/session/expandedView/ExpandedSessionGroup";
import { LocalWorkoutDetail, Saved } from "@/types/models";

type ExpandedSessionDetailsViewProps = {
  workoutId: number;
  groupedDetails: {
    exerciseOrder: number;
    details: Saved<LocalWorkoutDetail>[];
  }[];
  isLoading: boolean;
};

const ExpandedSessionDetailsView = ({
  workoutId,
  groupedDetails,
  isLoading,
}: ExpandedSessionDetailsViewProps) => {
  const { selectedGroups, toggleGroup } = useSelectedWorkoutGroups();

  const getIsSelected = (group: {
    exerciseOrder: number;
    details: Saved<LocalWorkoutDetail>[];
  }) =>
    selectedGroups.some(
      (g) =>
        group.details[0].workoutId === g.workoutId &&
        group.exerciseOrder === g.exerciseOrder
    );

  if (isLoading) {
    return <div className="mt-3 text-text-secondary">운동 정보를 불러오는 중...</div>;
  }

  return (
    <div className="mt-3">
      {groupedDetails.length > 0 && (
        <ul className="flex flex-col gap-3">
          {groupedDetails.map((group) => (
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
