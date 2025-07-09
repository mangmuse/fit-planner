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

export type SessionExerciseGroupProps = {
  exerciseOrder: number;
  details: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[];
  reload: () => Promise<void>;
  reorderAfterDelete: (deletedExerciseOrder: number) => Promise<void>;
  occurrence: number;
  updateDetailInGroups: (
    updatedDetail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>
  ) => void;
  addDetailToGroup: (
    newDetail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>,
    lastDetail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>
  ) => void;
  removeDetailFromGroup: (detailId: number) => void;
};

const SessionExerciseGroup = ({
  details,
  exerciseOrder,
  reload,
  occurrence,
  reorderAfterDelete,
  updateDetailInGroups,
  addDetailToGroup,
  removeDetailFromGroup,
}: SessionExerciseGroupProps) => {
  const { openBottomSheet } = useBottomSheet();
  const lastDetail = details[details.length - 1];

  const exerciseId = useMemo(() => details[0]?.exerciseId, [details]);

  const {
    data: exercise,
    isLoading: isExerciseLoading,
    error: exerciseError,
    execute: reloadExercise,
  } = useAsync(
    () => exerciseService.getExerciseWithLocalId(exerciseId),
    [exerciseId]
  );

  const { data: prevWorkoutDetails } = useAsync(async () => {
    const detail = await workoutDetailService.getLatestWorkoutDetailByDetail(
      details[0]
    );
    if (!detail) return [];
    const dd =
      await workoutDetailService.getLocalWorkoutDetailsByWorkoutIdAndExerciseId(
        detail.workoutId,
        exerciseId
      );
    const groupedaa = getGroupedDetails(dd);
    const aaDetailS = groupedaa[occurrence - 1]?.details || [];
    return aaDetailS
      .filter((d) => d.isDone)
      .map((d, i) => ({ ...d, setOrder: i + 1 }));
  }, [exerciseId, occurrence]);

  if (isExerciseLoading)
    return <div className="bg-bg-surface rounded-xl mb-3 min-h-[164px]" />;
  if (exerciseError)
    return (
      <ErrorState error={exerciseError.message} onRetry={reloadExercise} />
    );
  if (details.length === 0) return null;
  if (!exercise) return null;

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
          {/* TODO: 볼륨 표시 기능추가 */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
            <span className="font-normal">2,400kg</span>

            <span className="text-green-500 font-medium">+400kg</span>
          </div>
        </div>
        <button
          aria-label="운동 메뉴"
          onClick={() => {
            openBottomSheet({
              minHeight: 300,
              children: (
                <SessionDetailGroupOptions
                  reload={reload}
                  reorderAfterDelete={reorderAfterDelete}
                  loadExercises={reloadExercise}
                  details={details}
                  exercise={exercise}
                />
              ),
            });
          }}
          className="p-1.5 -mr-1 -mt-0.5 hover:bg-bg-base rounded-lg transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-text-muted" />
        </button>
      </div>
      <table className="w-full text-xs px-3">
        <SessionTableHeader
          prevDetails={prevWorkoutDetails || []}
          exercise={exercise}
          details={details}
          reload={reload}
          isRoutine={details[0] && "workoutId" in details[0] ? false : true}
        />
        <tbody>
          {details.map((detail, idx) => (
            <SessionItem
              key={detail.id}
              reload={reload}
              reorderAfterDelete={reorderAfterDelete}
              exercise={exercise}
              removeDetailFromGroup={removeDetailFromGroup}
              detail={detail}
              prevWorkoutDetail={(prevWorkoutDetails || [])[idx]}
              updateDetailInGroups={updateDetailInGroups}
            />
          ))}
        </tbody>
      </table>
      <div className="px-3 pb-3">
        <SetActions
          lastValue={lastDetail}
          addDetailToGroup={addDetailToGroup}
          removeDetailFromGroup={removeDetailFromGroup}
        />
      </div>
    </div>
  );
};

export default React.memo(SessionExerciseGroup);
