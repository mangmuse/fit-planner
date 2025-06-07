"use client;";

import { useSelectedWorkoutGroups } from "@/__mocks__/src/store/useSelectedWorkoutGroups";
import { getInitialWorkoutDetail } from "@/adapter/workoutDetail.adapter";
import PastWorkoutList from "@/app/(main)/workout/_components/PastWorkoutList";
import {
  getAllWorkouts,
  getWorkoutByUserIdAndDate,
} from "@/services/workout.service";
import {
  addLocalWorkoutDetail,
  getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder,
} from "@/services/workoutDetail.service";
import { LocalWorkout, LocalWorkoutDetail } from "@/types/models";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type LoadPastWorkoutSheetProps = {
  type: "ROUTINE" | "RECORD";
  startExerciseOrder: number;
  routineId?: number;
  date?: string;
};

const LoadPastWorkoutSheet = ({
  type,
  date,
  routineId,
  startExerciseOrder,
}: LoadPastWorkoutSheetProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const reset = useSelectedWorkoutGroups((state) => state.reset);
  const selectedGroups = useSelectedWorkoutGroups(
    (state) => state.selectedGroups
  );
  const params = useParams<{ date?: string; routineId?: string }>();
  const [pastWorkouts, setPastWorkouts] = useState<LocalWorkout[]>([]);

  const handleAddSelectedWorkout = async () => {
    await Promise.all(
      selectedGroups.map(async (group, index) => {
        const details = await getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder(
          group.workoutId,
          group.exerciseOrder
        );

        await Promise.all(
          details.map(async (detail) => {
            if (type === "RECORD") {
              if (!userId || !date)
                throw new Error("userId 또는 date가 없습니다");
              const workout = await getWorkoutByUserIdAndDate(userId, date);
              if (!workout || !workout.id) {
                throw new Error("해당 날짜의 운동 기록이 없습니다");
              }
              const initialDetail = getInitialWorkoutDetail();
              const newDetail: LocalWorkoutDetail = {
                ...initialDetail,
                workoutId: workout.id,
                exerciseId: detail.exerciseId,
                exerciseName: detail.exerciseName,
                exerciseOrder: startExerciseOrder + index + 1,
                setOrder: detail.setOrder,
                weight: detail.weight,
                reps: detail.reps,
                rpe: detail.rpe,
                setType: detail.setType,
              };
              await addLocalWorkoutDetail(newDetail);
            }
          })
        );
      })
    );

    // TODO 로직 함수로 분리 및 reload + 루틴로직추가
  };

  useEffect(() => {
    (async () => {
      let workouts = await getAllWorkouts(userId ?? "");

      if (params.date) {
        workouts = workouts.filter((workout) => workout.date !== params.date);
      }
      setPastWorkouts(workouts);
    })();

    return () => reset();
  }, [userId, params.date]);
  return (
    <>
      <PastWorkoutList pastWorkouts={pastWorkouts} />
      <button onClick={handleAddSelectedWorkout}>선택완료</button>
    </>
  );
};

export default LoadPastWorkoutSheet;

// 선택완료 클릭시

// => workoutId는 현재것으로, exerciseOrder는 startOrder + index로, 등등

// workoutContainer에서 전역상태로 workoutId 또는 routineId를 관리
