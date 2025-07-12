import SetActions from "@/app/(main)/_shared/session/sessionSet/SetActions";
import SessionDetailGroupOptions from "@/app/(main)/_shared/session/exerciseGroup/SessionDetailGroupOptions";
import SessionItem from "@/app/(main)/_shared/session/sessionSet/SessionItem";
import SessionTableHeader from "@/app/(main)/_shared/session/exerciseGroup/SessionTableHeader";
import ErrorState from "@/components/ErrorState";
import { useAsync } from "@/hooks/useAsync";
import { exerciseService, workoutDetailService } from "@/lib/di";

import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { LocalRoutineDetail, LocalWorkoutDetail, Saved } from "@/types/models";
import { MoreHorizontal } from "lucide-react";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import React, { useMemo } from "react";
import { calculateVolumeFromDetails } from "@/util/volumeCalculator";
import { useSessionData } from "@/app/(main)/_shared/session/SessionContainer";

export type SessionExerciseGroupProps = {
  exerciseOrder: number;
  details: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[];
  occurrence: number;
};

const SessionExerciseGroup = ({
  details,
  exerciseOrder,
  occurrence,
}: SessionExerciseGroupProps) => {
  const {
    reload,
    updateMultipleDetailsInGroups,

    removeMultipleDetailsInGroup,
    reorderExerciseOrderAfterDelete,
  } = useSessionData();
  const { openBottomSheet } = useBottomSheet();
  const lastDetail = details[details.length - 1];
  const exerciseId = useMemo(() => details[0]?.exerciseId, [details]);
  const groupUnit = useMemo(() => details[0]?.weightUnit || "kg", [details]);

  const currentVolume = useMemo(
    () => calculateVolumeFromDetails(details, groupUnit),
    [details, groupUnit]
  );

  const {
    data: exercise,
    isLoading: isExerciseLoading,
    error: exerciseError,
    execute: reloadExercise,
  } = useAsync(
    () => exerciseService.getExerciseWithLocalId(exerciseId),
    [exerciseId]
  );

  const { data: prevWorkoutDetails } = useAsync(async (): Promise<
    Saved<LocalWorkoutDetail>[]
  > => {
    const detail = await workoutDetailService.getLatestWorkoutDetailByDetail(
      details[0]
    );
    if (!detail) return [];
    const prevDetails =
      await workoutDetailService.getLocalWorkoutDetailsByWorkoutIdAndExerciseId(
        detail.workoutId,
        exerciseId
      );

    const groupedDetails = getGroupedDetails(prevDetails);
    const groupedPrevDetails = groupedDetails[occurrence - 1]?.details || [];

    return groupedPrevDetails
      .filter((d) => d.isDone)
      .map((d, i) => ({ ...d, setOrder: i + 1 }));
  }, [exerciseId, occurrence]);

  const prevVolume = useMemo(() => {
    return calculateVolumeFromDetails(prevWorkoutDetails || [], groupUnit);
  }, [prevWorkoutDetails, groupUnit]);

  const volumeDiff = currentVolume - prevVolume;

  if (isExerciseLoading)
    return <div className="bg-bg-surface rounded-xl mb-3 min-h-[164px]" />;
  if (exerciseError)
    return (
      <ErrorState error={exerciseError.message} onRetry={reloadExercise} />
    );
  if (details.length === 0) return null;
  if (!exercise) return null;

  const handleOpenMenu = () => {
    openBottomSheet({
      minHeight: 300,
      children: (
        <SessionDetailGroupOptions
          exerciseOrder={exerciseOrder}
          loadExercises={reloadExercise}
          details={details}
          exercise={exercise}
          reload={reload}
          updateMultipleDetailsInGroups={updateMultipleDetailsInGroups}
          removeMultipleDetailsInGroup={removeMultipleDetailsInGroup}
          reorderExerciseOrderAfterDelete={reorderExerciseOrderAfterDelete}
        />
      ),
    });
  };

  return (
    <div className="bg-bg-surface font-semibold rounded-xl mb-3 ">
      <div className="flex px-3 py-2.5 items-start justify-between">
        <div className="flex flex-col">
          <h6 className="flex items-center gap-1.5 text-sm">
            <span data-testid="exercise-order" className="text-text-muted">
              {exerciseOrder}
            </span>
            <span className="font-medium">{exercise.name}</span>
          </h6>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
            <span className="font-normal">
              {currentVolume.toLocaleString()}
              {groupUnit}
            </span>
            {prevWorkoutDetails && volumeDiff !== 0 && (
              <span
                className={`font-medium ${
                  volumeDiff > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {volumeDiff > 0 ? "+" : ""}
                {volumeDiff.toLocaleString()}
                {groupUnit}
              </span>
            )}
          </div>
        </div>
        <button
          aria-label="운동 메뉴"
          onClick={handleOpenMenu}
          className="p-1.5 -mr-1 -mt-0.5 hover:bg-bg-base rounded-lg transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-text-muted" />
        </button>
      </div>
      <table className="w-full text-xs px-3">
        <SessionTableHeader
          prevDetails={prevWorkoutDetails || []}
          detail={details[0]}
        />
        <tbody>
          {details.map((detail, idx) => (
            <SessionItem
              key={detail.id}
              detail={detail}
              prevWorkoutDetail={(prevWorkoutDetails || [])[idx]}
              group={{
                exerciseOrder,
                details,
              }}
              isLastSet={idx === details.length - 1}
            />
          ))}
        </tbody>
      </table>
      <div className="px-3 pb-3">
        <SetActions exerciseOrder={exerciseOrder} lastValue={lastDetail} />
      </div>
    </div>
  );
};

export default React.memo(SessionExerciseGroup);
