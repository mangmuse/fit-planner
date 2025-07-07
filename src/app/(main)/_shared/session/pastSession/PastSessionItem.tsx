import ExpandedSessionDetailsView from "@/app/(main)/_shared/session/expandedView/ExpandedSessionDetailsView";
import { LocalWorkout, LocalWorkoutDetail, Saved } from "@/types/models";
import { useState } from "react";
import Image from "next/image";
import chevronDown from "public/chevron-down.svg";
import { useSelectedWorkoutGroups } from "@/store/useSelectedWorkoutGroups";
import { workoutDetailService } from "@/lib/di";
import { SelectedGroupKey } from "@/store/useSelectedWorkoutGroups";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import { useAsync } from "@/hooks/useAsync";
import ErrorState from "@/components/ErrorState";

type PastSessionItemProps = {
  workout: LocalWorkout;
};

const PastSessionItem = ({ workout }: PastSessionItemProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { selectedGroups, toggleAllGroups } = useSelectedWorkoutGroups();

  const handleToggleExpand = () => setIsExpanded((prev) => !prev);

  const {
    data: workoutDetails,
    isLoading,
    error,
    execute,
  } = useAsync(async () => {
    if (!workout.id || !isExpanded) return [];
    return await workoutDetailService.getLocalWorkoutDetailsByWorkoutId(
      workout.id
    );
  }, [workout.id, isExpanded]);

  const groupedDetails = workoutDetails
    ? getGroupedDetails(workoutDetails)
    : [];

  const allGroups =
    !workout.id || groupedDetails.length === 0
      ? []
      : groupedDetails.map((group) => ({
          workoutId: workout.id!,
          exerciseOrder: group.exerciseOrder,
        }));

  const isSelectedAll =
    allGroups.length === 0
      ? false
      : allGroups.every((group) =>
          selectedGroups.some(
            (s) =>
              s.workoutId === group.workoutId &&
              s.exerciseOrder === group.exerciseOrder
          )
        );

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleAllGroups(allGroups);
  };

  return (
    <li key={workout.id} className="bg-bg-surface rounded-xl overflow-hidden">
      <div className="px-4 py-4 hover:bg-bg-surface-variant transition-colors">
        <button
          onClick={handleToggleExpand}
          className="w-full flex items-center justify-between"
        >
          <span className="text-base font-medium">{workout.date}</span>
          <Image
            src={chevronDown}
            alt="펼치기"
            width={20}
            height={20}
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
        {isExpanded && (
          <button
            onClick={handleSelectAll}
            className="mt-3 px-3 py-1.5 bg-bg-secondary rounded-lg text-sm hover:bg-bg-base transition-colors"
          >
            {isSelectedAll ? "전체 해제" : "전체 선택"}
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border-gray">
          {error ? (
            <ErrorState
              error="운동 정보를 불러오는 중 오류가 발생했습니다"
              onRetry={execute}
            />
          ) : (
            <ExpandedSessionDetailsView
              workoutId={workout.id!}
              groupedDetails={groupedDetails}
              isLoading={isLoading}
            />
          )}
        </div>
      )}
    </li>
  );
};

export default PastSessionItem;
