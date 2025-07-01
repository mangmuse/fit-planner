"use client;";

import { useSelectedWorkoutGroups } from "@/store/useSelectedWorkoutGroups";
import PastSessionList from "@/app/(main)/_shared/session/pastSession/PastSessionList";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";

import {
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
} from "@/types/models";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  routineDetailAdapter,
  routineDetailService,
  routineService,
  workoutDetailAdapter,
  workoutDetailService,
  workoutService,
} from "@/lib/di";

type LoadPastSessionSheetProps = {
  type: "ROUTINE" | "RECORD";
  reload: () => Promise<void>;
  startExerciseOrder: number;
  routineId?: number;
  date?: string;
};

const LoadPastSessionSheet = ({
  type,
  date,
  routineId,
  reload,
  startExerciseOrder,
}: LoadPastSessionSheetProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { closeBottomSheet } = useBottomSheet();
  const reset = useSelectedWorkoutGroups((state) => state.reset);
  const selectedGroups = useSelectedWorkoutGroups(
    (state) => state.selectedGroups
  );
  const params = useParams<{ date?: string; routineId?: string }>();
  const [pastWorkouts, setPastWorkouts] = useState<LocalWorkout[]>([]);

  const handleAddSelectedWorkout = async () => {
    // TODO: 선택한 그룹 수만큼 DB 쿼리 발생.
    // 배치 처리나 JOIN 쿼리로 최적화 필요
    await Promise.all(
      selectedGroups.map(async (group, index) => {
        const details =
          await workoutDetailService.getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder(
            group.workoutId,
            group.exerciseOrder
          );

        await Promise.all(
          details.map(async (detail) => {
            const newExerciseOrder = startExerciseOrder + index + 1;

            if (type === "RECORD") {
              if (!userId || !date) {
                console.error("userId 또는 date가 없습니다");
                return;
              }
              const workout = await workoutService.getWorkoutByUserIdAndDate(
                userId,
                date
              );
              if (!workout || !workout.id) {
                console.error("workout ID가 없습니다");
                return;
              }

              const newDetail =
                workoutDetailAdapter.mapPastWorkoutToWorkoutDetail(
                  detail,
                  workout.id,
                  newExerciseOrder
                );
              await workoutDetailService.addLocalWorkoutDetail(newDetail);
            } else if (type === "ROUTINE") {
              if (!routineId) return;
              const routine =
                await routineService.getRoutineByLocalId(routineId);
              if (!routine || !routine.id) {
                console.error("루틴 ID가 없습니다");
                return;
              }

              const newDetail =
                routineDetailAdapter.mapPastWorkoutToRoutineDetail(
                  detail,
                  routine.id,
                  newExerciseOrder
                );
              await routineDetailService.addLocalRoutineDetail(newDetail);
            }
          })
        );
      })
    );
    await reload();
    closeBottomSheet();
  };

  useEffect(() => {
    (async () => {
      const workouts = await workoutService.getAllWorkouts(userId ?? "");

      const filteredWorkouts = workouts
        .filter((workout) => workout.status !== "EMPTY")
        .filter((workout) => !params.date || workout.date !== params.date);

      setPastWorkouts(filteredWorkouts);
    })();

    return () => reset();
  }, [userId, params.date]);
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
        <PastSessionList pastWorkouts={pastWorkouts} />
      </div>
      <div className="sticky bottom-0 p-4 bg-bg-primary border-t border-border-gray">
        <button
          onClick={handleAddSelectedWorkout}
          disabled={selectedGroups.length === 0}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
            selectedGroups.length > 0
              ? "bg-primary text-bg-base hover:bg-primary/90 active:scale-95"
              : "bg-bg-surface text-text-muted cursor-not-allowed"
          }`}
        >
          {selectedGroups.length > 0
            ? `선택완료 (${selectedGroups.length}개)`
            : "운동을 선택해주세요"}
        </button>
      </div>
    </div>
  );
};

export default LoadPastSessionSheet;

// 선택완료 클릭시

// => workoutId는 현재것으로, exerciseOrder는 startOrder + index로, 등등

// workoutContainer에서 전역상태로 workoutId 또는 routineId를 관리
