"use client";

import SessionPlaceholder from "@/app/(main)/_shared/session/SessionPlaceholder";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Trash2, ChevronsUpDown } from "lucide-react";

import useLoadDetails from "@/hooks/useLoadDetails";

import { useModal } from "@/providers/contexts/ModalContext";
import ErrorState from "@/components/ErrorState";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useCallback } from "react";
import {
  routineDetailService,
  routineService,
  workoutDetailService,
  workoutService,
} from "@/lib/di";
import {
  isWorkoutDetail,
  isWorkoutDetails,
} from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import {
  LocalWorkout,
  LocalWorkoutDetail,
  LocalRoutineDetail,
} from "@/types/models";
import SessionExerciseGroup from "@/app/(main)/_shared/session/exerciseGroup/SessionExerciseGroup";
import SessionSequence from "@/app/(main)/_shared/session/sessionSequence/SessionSequence";
import LoadPastSessionSheet from "@/app/(main)/_shared/session/pastSession/LoadPastSessionSheet";
import {
  calculateTotalVolume,
  calculateVolumeFromDetails,
} from "@/util/volumeCalculator";
import { useWeightUnitPreference } from "@/hooks/useWeightUnitPreference";

type SessionContainerProps = {
  type: "ROUTINE" | "RECORD";
  routineId?: number;
  date?: string;
  formattedDate?: string | React.ReactNode;
};

const SessionContainer = ({
  type,
  date,
  routineId,
  formattedDate,
}: SessionContainerProps) => {
  const userId = useSession().data?.user?.id;
  const {
    error,
    isLoading,
    workoutGroups,
    reload,
    workout,
    allDetails,
    setWorkout,
    updateDetailInGroups,
    updateMultipleDetailsInGroups,
    addDetailToGroup,
    removeDetailFromGroup,
  } = useLoadDetails({
    type,
    userId: userId ?? "",
    date,
    routineId,
  });
  const { openBottomSheet, isOpen: isBottomSheetOpen } = useBottomSheet();
  const { openModal, isOpen: isModalOpen, showError } = useModal();
  const [weightUnit] = useWeightUnitPreference();
  const router = useRouter();
  const pathname = usePathname();

  const occurrenceData = useMemo(() => {
    const countMap = new Map<number, number>();
    const exerciseOrderToOccurrenceMap = new Map();
    workoutGroups.forEach((group) => {
      const exerciseId = group.details[0].exerciseId;
      const count = countMap.get(exerciseId) || 0;
      countMap.set(exerciseId, count + 1);
      exerciseOrderToOccurrenceMap.set(group.exerciseOrder, count + 1);
    });

    return exerciseOrderToOccurrenceMap;
  }, [workoutGroups]);

  const totalCurrentVolume = useMemo(
    () => calculateTotalVolume(workoutGroups, weightUnit),
    [workoutGroups, weightUnit]
  );

  const handleOpenLocalWorkoutSheet = useCallback(() => {
    openBottomSheet({
      height: "100dvh",
      rounded: false,
      children: (
        <LoadPastSessionSheet
          type={type}
          routineId={routineId}
          startExerciseOrder={workoutGroups.length + 1}
          date={date}
          reload={reload}
        />
      ),
    });
  }, [openBottomSheet, type, routineId, workoutGroups.length, date, reload]);

  const reorderAfterDelete = useCallback(
    async (deletedExerciseOrder: number): Promise<void> => {
      try {
        let latestDetails: (LocalWorkoutDetail | LocalRoutineDetail)[] = [];

        if (type === "RECORD" && userId && date) {
          latestDetails = await workoutDetailService.getLocalWorkoutDetails(
            userId,
            date
          );
        } else if (type === "ROUTINE" && routineId) {
          latestDetails =
            await routineDetailService.getLocalRoutineDetails(routineId);
        }

        const affectedDetails = latestDetails.filter(
          (d) => d.exerciseOrder > deletedExerciseOrder
        );

        await Promise.all(
          affectedDetails.map((detail) => {
            const updated = {
              ...detail,
              exerciseOrder: detail.exerciseOrder - 1,
            };
            if (isWorkoutDetail(detail)) {
              return workoutDetailService.updateLocalWorkoutDetail(updated);
            } else {
              return routineDetailService.updateLocalRoutineDetail(updated);
            }
          })
        );
      } catch (e) {
        console.error("[SessionContainer] reorderAfterDelete Error", e);
        showError("운동 상태를 동기화하는 데 실패했습니다");
      }
    },
    [type, userId, date, routineId, showError]
  );

  const handleDeleteAll = useCallback(async () => {
    try {
      async function deleteAll() {
        let targetPath = "/";
        if (type === "RECORD" && isWorkoutDetails(allDetails) && workout?.id) {
          if (allDetails.length === 0) return;
          await workoutDetailService.deleteWorkoutDetails(allDetails);
          await workoutService.deleteLocalWorkout(workout.id);
        } else if (
          type === "ROUTINE" &&
          !isWorkoutDetails(allDetails) &&
          routineId
        ) {
          if (allDetails.length === 0) return;
          if (!routineId) {
            console.error("루틴 ID를 찾을 수 없습니다");
            return;
          }
          await routineDetailService.deleteRoutineDetails(allDetails);
          await routineService.deleteLocalRoutine(routineId);
          targetPath = `/routines`;
        }

        router.push(targetPath);
        setWorkout(null);
      }
      openModal({
        type: "confirm",
        title: "운동 전체 삭제",
        message: "모든 운동을 삭제하시겠습니까?",
        onConfirm: async () => deleteAll(),
      });
    } catch (e) {
      console.error("[SessionContainer] Error", e);
      showError("운동 전체 삭제에 실패했습니다");
    }
  }, [
    type,
    allDetails,
    workout?.id,
    routineId,
    router,
    setWorkout,
    openModal,
    showError,
  ]);

  const handleCompleteWorkout = useCallback(async () => {
    try {
      if (type !== "RECORD") return;
      if (!workout?.id) {
        console.error("Workout을 찾을 수 없습니다");
        return;
      }
      const updatedWorkout: Partial<LocalWorkout> = {
        id: workout.id,
        status: "COMPLETED",
      };
      await workoutService.updateLocalWorkout(updatedWorkout);

      router.push("/");
    } catch (e) {
      console.error("[SessionContainer] Error", e);
      showError("운동 완료 처리에 실패했습니다");
    }
  }, [type, workout?.id, router, showError]);

  const handleClickCompleteBtn = useCallback(
    () =>
      openModal({
        type: "confirm",
        title: "운동 완료",
        message: "운동을 완료하시겠습니까?",
        onConfirm: async () => handleCompleteWorkout(),
      }),
    [openModal, handleCompleteWorkout]
  );

  const handleOpenSequenceSheet = useCallback(
    () =>
      openBottomSheet({
        height: "100dvh",
        children: (
          <SessionSequence detailGroups={workoutGroups} reload={reload} />
        ),
      }),
    [openBottomSheet, workoutGroups, reload]
  );

  const exercisePath =
    type === "RECORD"
      ? `/workout/${date}/exercises`
      : `/routines/${routineId}/exercises`;

  const placeholderProps =
    type === "ROUTINE"
      ? { type: "ROUTINE" as const }
      : { type: "RECORD" as const, date: date!, userId: userId! };

  useEffect(() => {
    const handlePopState = () => {
      if (isModalOpen || isBottomSheetOpen) return;

      if (pathname.startsWith("/workout")) {
        router.push("/");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname, isModalOpen]);

  if (isLoading) return null;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <div>
      {workoutGroups.length !== 0 ? (
        <>
          {(formattedDate || type === "ROUTINE") && (
            <div className="flex justify-between items-center mb-6 ">
              {formattedDate &&
                (typeof formattedDate === "string" ? (
                  <time className="text-2xl font-bold">{formattedDate}</time>
                ) : (
                  <div className="text-2xl font-bold">{formattedDate}</div>
                ))}
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAll}
                  className="p-2 hover:bg-bg-surface rounded-lg transition-colors"
                  aria-label="전체 삭제"
                >
                  <Trash2 className="w-6 h-6 text-text-muted" />
                </button>
                <button
                  onClick={handleOpenSequenceSheet}
                  className="p-2 hover:bg-bg-surface rounded-lg transition-colors"
                  aria-label="순서 변경"
                >
                  <ChevronsUpDown className="w-6 h-6 text-text-muted" />
                </button>
              </div>
            </div>
          )}

          {workoutGroups.length > 0 && (
            <div className="bg-bg-surface rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">총 볼륨</span>
                <span className="text-lg font-semibold">
                  {totalCurrentVolume.toLocaleString()}{weightUnit}
                </span>
              </div>
            </div>
          )}

          <ul className="flex flex-col gap-2.5 scrollbar-none">
            {workoutGroups.map(({ exerciseOrder, details }) => (
              <SessionExerciseGroup
                key={`${exerciseOrder}-${details[0]?.exerciseId}`}
                details={details}
                reorderAfterDelete={reorderAfterDelete}
                occurrence={occurrenceData.get(exerciseOrder)}
                exerciseOrder={exerciseOrder}
                reload={reload}
                updateDetailInGroups={updateDetailInGroups}
                updateMultipleDetailsInGroups={updateMultipleDetailsInGroups}
                removeDetailFromGroup={removeDetailFromGroup}
                addDetailToGroup={addDetailToGroup}
              />
            ))}
          </ul>

          <div className="flex gap-2 mt-2">
            <Link
              href={exercisePath}
              replace
              className="flex-1 py-2.5 bg-bg-surface text-sm rounded-lg text-center hover:bg-bg-surface-variant transition-colors"
            >
              운동 추가
            </Link>
            <button
              onClick={handleOpenLocalWorkoutSheet}
              className="flex-1 py-2.5 bg-bg-surface text-sm rounded-lg hover:bg-bg-surface-variant transition-colors"
            >
              불러오기
            </button>
          </div>
          {type === "RECORD" && workout?.status !== "COMPLETED" && (
            <button
              onClick={handleClickCompleteBtn}
              className="w-full mt-6 py-3 bg-primary text-text-black font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all duration-200"
            >
              운동 완료
            </button>
          )}
        </>
      ) : (
        <>
          {formattedDate && (
            <div className="mb-6">
              <time className="text-2xl font-bold">{formattedDate}</time>
            </div>
          )}
          <SessionPlaceholder reloadDetails={reload} {...placeholderProps} />
        </>
      )}
    </div>
  );
};

export default SessionContainer;
