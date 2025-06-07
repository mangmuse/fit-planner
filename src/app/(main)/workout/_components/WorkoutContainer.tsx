"use client";

import WorkoutSequence from "@/app/(main)/workout/_components/WorkoutSequence";
import WorkoutExerciseGroup from "@/app/(main)/workout/_components/WorkoutExerciseGroup";
import WorkoutPlaceholder from "@/app/(main)/workout/_components/WorkoutPlaceholder";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";

import { useSession } from "next-auth/react";
import Link from "next/link";

import useLoadDetails from "@/hooks/useLoadDetails";
import LoadPastWorkoutSheet from "@/app/(main)/workout/_components/LoadPastWorkoutSheet";

type WorkoutContainerProps = {
  type: "ROUTINE" | "RECORD";
  routineId?: number;
  date?: string;
};

const WorkoutContainer = ({ type, date, routineId }: WorkoutContainerProps) => {
  const userId = useSession().data?.user?.id;
  const { isLoading, workoutGroups, reload, reorderAfterDelete } =
    useLoadDetails({
      type,
      userId: userId ?? "",
      date,
      routineId,
    });
  const { openBottomSheet } = useBottomSheet();
  console.log(workoutGroups);
  const handleOpenLocalWorkoutSheet = () => {
    openBottomSheet({
      height: "95vh",
      children: (
        <LoadPastWorkoutSheet
          type={type}
          routineId={routineId}
          startExerciseOrder={workoutGroups.length + 1}
          date={date}
        />
      ),
    });
  };

  const exercisePath =
    type === "RECORD"
      ? `/workout/${date}/exercises`
      : `/routines/${routineId}/exercises`;

  // type이 record일때에는 workoutId도 전달함
  const placeholderProps =
    type === "ROUTINE"
      ? { type: "ROUTINE" as const }
      : { type: "RECORD" as const, date: date!, userId: userId! };

  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      {workoutGroups.length !== 0 ? (
        <ul className="flex flex-col gap-2.5">
          {workoutGroups.map(({ exerciseOrder, details }) => (
            <WorkoutExerciseGroup
              key={exerciseOrder}
              details={details}
              reorderAfterDelete={reorderAfterDelete}
              exerciseOrder={exerciseOrder}
              reload={reload}
            />
          ))}
          <Link href={exercisePath}>운동 추가</Link>
          <button
            onClick={() =>
              openBottomSheet({
                height: "100vh",
                children: (
                  <WorkoutSequence
                    detailGroups={workoutGroups}
                    reload={reload}
                  />
                ),
              })
            }
          >
            순서바꾸는 버튼
          </button>
          <button onClick={handleOpenLocalWorkoutSheet}>불러오기</button>
        </ul>
      ) : (
        <WorkoutPlaceholder reloadDetails={reload} {...placeholderProps} />
      )}
    </div>
  );
};

export default WorkoutContainer;
