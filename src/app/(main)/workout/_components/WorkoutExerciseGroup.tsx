import SetActions from "@/app/(main)/workout/_components/SetActions";
import WorkoutDetailGroupOptions from "@/app/(main)/workout/_components/WorkoutDetailGroupOptions";
import WorkoutItem from "@/app/(main)/workout/_components/WorkoutItem";
import WorkoutTableHeader from "@/app/(main)/workout/_components/WorkoutTableHeader";

import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { getExerciseWithLocalId } from "@/services/exercise.service";
import {
  getLatestWorkoutDetailByExerciseId,
  getWorkoutGroupByWorkoutDetail,
} from "@/services/workoutDetail.service";
import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
} from "@/types/models";
import { set } from "lodash";
import Image from "next/image";
import menuIcon from "public/meatball.svg";
import { useEffect, useState } from "react";

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
  const [exercise, setExercise] = useState<LocalExercise | null>(null);
  const [prevWorkoutDetails, setPrevDetails] = useState<LocalWorkoutDetail[]>(
    []
  );
  const { openBottomSheet } = useBottomSheet();
  const lastDetail = details[details.length - 1];
  const fetchAndSetExerciseData = async () => {
    const exerciseData = await getExerciseWithLocalId(details[0].exerciseId);
    setExercise(exerciseData);
  };

  const getPrevious = async () => {
    const detail = await getLatestWorkoutDetailByExerciseId(details);
    if (!detail) return [];

    const workoutDetails = await getWorkoutGroupByWorkoutDetail(detail);
    const completedDetails = workoutDetails
      .filter((detail) => detail.isDone)
      .map((detail, idx) => ({ ...detail, setOrder: idx + 1 }));
    setPrevDetails(completedDetails);
  };

  useEffect(() => {
    (async () => {
      await fetchAndSetExerciseData();
      await getPrevious();
    })();
  }, [details]);

  if (details.length === 0) return null;
  return (
    exercise && (
      <div className="bg-bg-surface font-semibold pb-2.5">
        <div className="flex relative text-xs px-1 h-5 items-center justify-between">
          <h6 className="flex gap-1">
            <span data-testid="exercise-order">{exerciseOrder}</span>
            <span className="text-primary">{exercise?.name}</span>
          </h6>
          <button
            onClick={() => {
              openBottomSheet({
                minHeight: 300,
                children: (
                  <WorkoutDetailGroupOptions
                    reload={reload}
                    reorderAfterDelete={reorderAfterDelete}
                    loadExercises={fetchAndSetExerciseData}
                    details={details}
                    exercise={exercise}
                  />
                ),
              });
            }}
            className="cursor-pointer absolute top-[0.5px] right-2.5"
          >
            <Image src={menuIcon} alt="운동 메뉴" />
          </button>
        </div>
        <table className="w-full text-[10px]">
          <WorkoutTableHeader
            prevDetails={prevWorkoutDetails}
            exercise={exercise}
          />
          <tbody>
            {details.map((detail, idx) => (
              <WorkoutItem
                key={detail.id}
                reorderAfterDelete={reorderAfterDelete}
                exercise={exercise}
                reload={reload}
                workoutDetail={detail}
                prevWorkoutDetail={prevWorkoutDetails[idx]}
              />
            ))}
          </tbody>
        </table>
        <SetActions
          reorderAfterDelete={reorderAfterDelete}
          reload={reload}
          lastValue={lastDetail}
        />
      </div>
    )
  );
};

export default WorkoutExerciseGroup;
