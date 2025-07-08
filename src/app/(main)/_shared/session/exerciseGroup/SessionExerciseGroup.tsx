import SetActions from "@/app/(main)/_shared/session/sessionSet/SetActions";
import SessionDetailGroupOptions from "@/app/(main)/_shared/session/exerciseGroup/SessionDetailGroupOptions";
import SessionItem from "@/app/(main)/_shared/session/sessionSet/SessionItem";
import SessionTableHeader from "@/app/(main)/_shared/session/exerciseGroup/SessionTableHeader";
import ErrorState from "@/components/ErrorState";
import { useAsync } from "@/hooks/useAsync";
import { exerciseService, workoutDetailService } from "@/lib/di";

import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { LocalRoutineDetail, LocalWorkoutDetail, Saved } from "@/types/models";
import Image from "next/image";
import menuIcon from "public/meatball.svg";

export type SessionExerciseGroupProps = {
  exerciseOrder: number;
  details: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[];
  reload: () => Promise<void>;
  reorderAfterDelete: (deletedExerciseOrder: number) => Promise<void>;
};

const SessionExerciseGroup = ({
  details,
  exerciseOrder,
  reload,
  reorderAfterDelete,
}: SessionExerciseGroupProps) => {
  const { openBottomSheet } = useBottomSheet();
  const lastDetail = details[details.length - 1];

  const exerciseId = details[0]?.exerciseId;

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
    const workoutDetails =
      await workoutDetailService.getWorkoutGroupByWorkoutDetail(detail);
    return workoutDetails
      .filter((d) => d.isDone)
      .map((d, i) => ({ ...d, setOrder: i + 1 }));
  }, [exerciseId]);

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
      <div className="flex px-3 py-1 items-center justify-between">
        <h6 className="flex items-center gap-1.5 text-sm">
          <span data-testid="exercise-order" className="text-text-muted">
            {exerciseOrder}
          </span>
          <span className="font-medium">{exercise.name}</span>
        </h6>
        <button
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
          className="p-1.5 -mr-1 hover:bg-bg-base rounded-lg transition-colors"
        >
          <Image
            src={menuIcon}
            role="button"
            alt="운동 메뉴"
            width={20}
            height={20}
          />
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
              reorderAfterDelete={reorderAfterDelete}
              exercise={exercise}
              reload={reload}
              detail={detail}
              prevWorkoutDetail={(prevWorkoutDetails || [])[idx]}
            />
          ))}
        </tbody>
      </table>
      <div className="px-3 pb-3">
        <SetActions
          reorderAfterDelete={reorderAfterDelete}
          reload={reload}
          lastValue={lastDetail}
        />
      </div>
    </div>
  );
};

export default SessionExerciseGroup;
