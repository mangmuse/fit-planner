"use client";

import { workoutDetailAdapter } from "@/adapter/workoutDetail.adapter";
import RoutineList from "@/app/(main)/routines/_components/RoutineList";
import {
  routineDetailService,
  workoutDetailService,
  workoutService,
} from "@/lib/di";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";

import {
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
} from "@/types/models";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

type WorkoutPlaceholderProps = (
  | { type: "ROUTINE"; date?: undefined; userId?: undefined }
  | { type: "RECORD"; date: string; userId: string }
) & {
  reloadDetails?: () => Promise<void>;
};

function WorkoutPlaceholder({
  type,
  userId,
  date,
  reloadDetails,
}: WorkoutPlaceholderProps) {
  const pathname = usePathname();
  const { openBottomSheet } = useBottomSheet();

  const { routineId } = useParams();

  const handleClickRoutineBtn = () =>
    openBottomSheet({
      height: "100dvh",
      children: <RoutineList onPick={handlePickRoutine} />,
    });

  const handlePickRoutineForWorkout = async (
    routineDetails: LocalRoutineDetail[]
  ) => {
    if (!userId || !date) return;
    const workoutResult = await workoutService.getWorkoutByUserIdAndDate(
      userId,
      date
    );
    if (!workoutResult) throw new Error("Workout 을 찾을 수 없습니다.");
    const workout: LocalWorkout = workoutResult;
    const workoutId = workout.id;

    await Promise.all(
      routineDetails.map(async (detail) => {
        if (!workoutId) throw new Error("workoutId가 없습니다");
        const workoutDetail: LocalWorkoutDetail =
          workoutDetailAdapter.convertRoutineDetailToWorkoutDetailInput(
            detail,
            workoutId
          );
        workoutDetailService.addLocalWorkoutDetail(workoutDetail);
      })
    );
  };

  const handlePickRoutineForRoutine = async (
    routineDetails: LocalRoutineDetail[]
  ) => {
    if (!routineId) throw new Error("routineId가 없습니다");
    await Promise.all(
      routineDetails.map(async (detail) => {
        await routineDetailService.cloneRoutineDetailWithNewRoutineId(
          detail,
          Number(routineId)
        );
      })
    );
  };

  const handlePickRoutine = async (targetRoutineId: number) => {
    const routineDetails: LocalRoutineDetail[] =
      await routineDetailService.getLocalRoutineDetails(targetRoutineId);
    if (type === "RECORD") {
      await handlePickRoutineForWorkout(routineDetails);
    } else {
      await handlePickRoutineForRoutine(routineDetails);
    }

    reloadDetails?.();
  };
  const addExercisePath =
    type === "RECORD"
      ? `/workout/${date}/exercises`
      : `/routines/${routineId}/exercises`;
  return (
    <div className="flex flex-col mt-6 gap-3 ">
      <button
        onClick={handleClickRoutineBtn}
        className="flex justify-center items-center w-full h-[47px] font-bold rounded-2xl bg-primary text-text-black"
      >
        나의 루틴 가져오기
      </button>
      <Link
        href={addExercisePath}
        className="flex justify-center items-center w-full h-[47px] font-bold rounded-2xl bg-primary text-text-black"
      >
        운동 추가하기
      </Link>
    </div>
  );
}

export default WorkoutPlaceholder;
