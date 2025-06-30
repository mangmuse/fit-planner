import SetActions from "@/app/(main)/workout/_components/SetActions";
import WorkoutDetailGroupOptions from "@/app/(main)/workout/_components/WorkoutDetailGroupOptions";
import WorkoutItem from "@/app/(main)/workout/_components/WorkoutItem";
import WorkoutTableHeader from "@/app/(main)/workout/_components/WorkoutTableHeader";
import ErrorState from "@/components/ErrorState";
import { useAsync } from "@/hooks/useAsync";
import { exerciseService, workoutDetailService } from "@/lib/di";

import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import Image from "next/image";
import menuIcon from "public/meatball.svg";

type WorkoutExerciseGroupProps = {
  exerciseOrder: number;
  details: LocalWorkoutDetail[] | LocalRoutineDetail[];
  reload: () => Promise<void>;
  reorderAfterDelete: (deletedExerciseOrder: number) => Promise<void>;
};

const WorkoutExerciseGroup = ({
  details,
  exerciseOrder,
  reload,
  reorderAfterDelete,
}: WorkoutExerciseGroupProps) => {
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
    const detail =
      await workoutDetailService.getLatestWorkoutDetailByExerciseId(details[0]);
    if (!detail) return [];
    const workoutDetails =
      await workoutDetailService.getWorkoutGroupByWorkoutDetail(detail);
    return workoutDetails
      .filter((d) => d.isDone)
      .map((d, i) => ({ ...d, setOrder: i + 1 }));
  }, [exerciseId]);

  if (isExerciseLoading) return <div>Loading...</div>;
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
                <WorkoutDetailGroupOptions
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
          <Image src={menuIcon} alt="운동 메뉴" width={20} height={20} />
        </button>
      </div>
      <table className="w-full text-xs px-3">
        <WorkoutTableHeader
          prevDetails={prevWorkoutDetails || []}
          exercise={exercise}
          details={details}
          reload={reload}
          isRoutine={details[0] && "workoutId" in details[0] ? false : true}
        />
        <tbody>
          {details.map((detail, idx) => (
            <WorkoutItem
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

export default WorkoutExerciseGroup;
