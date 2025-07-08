"use client";

import RoutineList from "@/app/(main)/routines/_components/routineList/RoutineList";
import LoadPastSessionSheet from "@/app/(main)/_shared/session/pastSession/LoadPastSessionSheet";
import {
  routineDetailService,
  workoutDetailAdapter,
  workoutDetailService,
  workoutService,
} from "@/lib/di";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { useModal } from "@/providers/contexts/ModalContext";

import {
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
  Saved,
} from "@/types/models";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Plus, Download, FileText } from "lucide-react";

export type SessionPlaceholderProps = (
  | { type: "ROUTINE"; date?: undefined; userId?: undefined }
  | { type: "RECORD"; date: string; userId: string }
) & {
  reloadDetails?: () => Promise<void>;
};

function SessionPlaceholder({
  type,
  userId,
  date,
  reloadDetails,
}: SessionPlaceholderProps) {
  const pathname = usePathname();
  const { openBottomSheet } = useBottomSheet();
  const { showError } = useModal();

  const { routineId } = useParams();

  if (type === "ROUTINE" && !routineId) {
    return null;
  }

  const handleClickRoutineBtn = () =>
    openBottomSheet({
      height: "100dvh",
      children: <RoutineList onPick={handlePickRoutine} />,
    });

  const handleOpenLocalWorkoutSheet = () => {
    openBottomSheet({
      height: "100dvh",
      rounded: false,
      children: (
        <LoadPastSessionSheet
          type={type}
          date={date}
          routineId={routineId ? Number(routineId) : undefined}
          reload={reloadDetails || (async () => {})}
          startExerciseOrder={1}
        />
      ),
    });
  };

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
    routineDetails: Saved<LocalRoutineDetail>[]
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
    try {
      const routineDetails: Saved<LocalRoutineDetail>[] =
        await routineDetailService.getLocalRoutineDetails(targetRoutineId);
      if (type === "RECORD") {
        await handlePickRoutineForWorkout(routineDetails);
      } else {
        await handlePickRoutineForRoutine(routineDetails);
      }

      reloadDetails?.();
    } catch (e) {
      console.error(e);
      showError("루틴 가져오기에 실패했습니다.");
    }
  };
  const addExercisePath =
    type === "RECORD"
      ? `/workout/${date}/exercises`
      : `/routines/${routineId}/exercises`;

  return (
    <div className="flex flex-col mt-8 gap-4 px-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-text-white mb-2">
          운동을 시작해보세요
        </h3>
        <p className="text-sm text-text-muted">
          루틴을 불러오거나
          <br /> 새로운 운동을 추가할 수 있습니다
        </p>
      </div>

      {/* 버튼 그룹 */}
      <div className="space-y-3">
        <button
          onClick={handleClickRoutineBtn}
          className="flex items-center justify-center w-full h-14 rounded-2xl bg-primary text-text-black font-semibold"
        >
          <FileText className="w-5 h-5 mr-2" />
          나의 루틴 가져오기
        </button>

        <button
          onClick={handleOpenLocalWorkoutSheet}
          className="flex items-center justify-center w-full h-14 rounded-2xl bg-bg-surface text-text-white font-semibold"
        >
          <Download className="w-5 h-5 mr-2" />
          불러오기
        </button>

        <Link
          href={addExercisePath}
          className="flex items-center justify-center w-full h-14 rounded-2xl bg-text-white border-2 border-border-gray text-text-black font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          운동 추가하기
        </Link>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-text-muted/70 rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-text-muted/50 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
}

export default SessionPlaceholder;
