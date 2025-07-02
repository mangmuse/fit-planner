import { useSelectedWorkoutGroups } from "@/store/useSelectedWorkoutGroups";
import ExpandedSessionGroup from "@/app/(main)/_shared/session/expandedView/ExpandedSessionGroup";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import { workoutDetailService } from "@/lib/di";
import { useAsync } from "@/hooks/useAsync";
import ErrorState from "@/components/ErrorState";
import { LocalWorkoutDetail } from "@/types/models";

type ExpandedSessionDetailsViewProps = {
  workoutId: number;
};

const ExpandedSessionDetailsView = ({
  workoutId,
}: ExpandedSessionDetailsViewProps) => {
  const { selectedGroups, toggleGroup } = useSelectedWorkoutGroups();

  const {
    data: expandedDetails = [],
    error,
    execute,
  } = useAsync(async () => {
    const details =
      await workoutDetailService.getLocalWorkoutDetailsByWorkoutId(workoutId);
    return getGroupedDetails(details);
  }, [workoutId]);

  const getIsSelected = (group: {
    exerciseOrder: number;
    details: LocalWorkoutDetail[];
  }) =>
    selectedGroups.some(
      (g) =>
        group.details[0].workoutId === g.workoutId &&
        group.exerciseOrder === g.exerciseOrder
    );

  if (error) {
    return (
      <ErrorState
        error="운동 상세 정보를 불러오는 중 오류가 발생했습니다"
        onRetry={execute}
      />
    );
  }

  return (
    <div className="mt-3">
      {(expandedDetails?.length ?? 0) > 0 && (
        <ul className="flex flex-col gap-3">
          {expandedDetails?.map((group) => (
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
