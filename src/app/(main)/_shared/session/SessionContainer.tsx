"use client";

import SessionPlaceholder from "@/app/(main)/_shared/session/SessionPlaceholder";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Trash2, ChevronsUpDown } from "lucide-react";

import useLoadDetails, { SessionGroup } from "@/hooks/useLoadDetails";

import { useModal } from "@/providers/contexts/ModalContext";
import ErrorState from "@/components/ErrorState";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import {
  routineDetailService,
  workoutDetailService,
  workoutService,
} from "@/lib/di";
import {
  LocalWorkout,
  LocalWorkoutDetail,
  LocalRoutineDetail,
  Saved,
} from "@/types/models";
import SessionExerciseGroup from "@/app/(main)/_shared/session/exerciseGroup/SessionExerciseGroup";
import SessionSequence from "@/app/(main)/_shared/session/sessionSequence/SessionSequence";
import LoadPastSessionSheet from "@/app/(main)/_shared/session/pastSession/LoadPastSessionSheet";
import { calculateTotalVolume } from "@/util/volumeCalculator";
import { useWeightUnitPreference } from "@/hooks/useWeightUnitPreference";
import { SessionDetailType } from "@/types/services";
import SessionHeader from "@/app/(main)/_shared/session/SessionHeader";

type SessionContainerProps = {
  type: "ROUTINE" | "RECORD";
  routineId?: number;
  date?: string;
  formattedDate?: string | ReactNode;
};

export type SessionData = {
  sessionGroup: SessionGroup[];
  type: SessionDetailType;
  updateDetailInGroups: (
    updatedDetail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>
  ) => void;
  removeMultipleDetailsInGroup: (
    details: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[]
  ) => void;
  addDetailToGroup: (
    newDetail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>,
    lastDetail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>
  ) => void;
  removeDetailFromGroup: (detailId: number) => void;
  updateMultipleDetailsInGroups: (
    updatedDetails: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[]
  ) => void;
  reload: () => Promise<void>;
  reorderExerciseOrderAfterDelete: (
    deletedExerciseOrder: number
  ) => Promise<void>;
  reorderSetOrderAfterDelete: (
    exerciseId: number,
    deletedSetOrder: number
  ) => Promise<void>;
};
const SessionDataContext = createContext<SessionData | null>(null);

export const useSessionData = () => {
  const context = useContext(SessionDataContext);
  if (!context)
    throw new Error("useSessionData must be used within SessionContainer");
  return context;
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
    setWorkout,
    updateDetailInGroups,
    updateMultipleDetailsInGroups,
    addDetailToGroup,
    removeDetailFromGroup,
    removeMultipleDetailsInGroup,
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

  const reorderExerciseOrderAfterDelete = useCallback(
    async (deletedExerciseOrder: number): Promise<void> => {
      try {
        if (type === "RECORD" && workout?.id) {
          await workoutDetailService.reorderExerciseOrderAfterDelete(
            workout.id,
            deletedExerciseOrder
          );
        } else if (type === "ROUTINE" && routineId) {
          await routineDetailService.reorderExerciseOrderAfterDelete(
            routineId,
            deletedExerciseOrder
          );
        }
      } catch (e) {
        console.error("[SessionContainer] reorderAfterDelete Error", e);
        showError("운동 상태를 동기화하는 데 실패했습니다");
      }
    },
    [type, workout?.id, routineId, showError]
  );
  const reorderSetOrderAfterDelete = useCallback(
    async (exerciseId: number, deletedSetOrder: number): Promise<void> => {
      let updatedDetails:
        | Saved<LocalWorkoutDetail>[]
        | Saved<LocalRoutineDetail>[] = [];
      try {
        if (type === "RECORD" && workout?.id) {
          updatedDetails =
            await workoutDetailService.reorderSetOrderAfterDelete(
              workout.id,
              exerciseId,
              deletedSetOrder
            );
        } else if (type === "ROUTINE" && routineId) {
          updatedDetails =
            await routineDetailService.reorderSetOrderAfterDelete(
              routineId,
              exerciseId,
              deletedSetOrder
            );
        }
        updateMultipleDetailsInGroups(updatedDetails);
      } catch (e) {
        console.error("[SessionContainer] reorderSetOrderAfterDelete Error", e);
        showError("세트 순서 업데이트에 실패했습니다");
      }
    },
    [type, workout?.id, routineId, updateMultipleDetailsInGroups, showError]
  );

  const handleDeleteAll = useCallback(async () => {
    try {
      async function deleteAll() {
        let targetPath = "/";

        if (type === "RECORD" && workout?.id) {
          await workoutDetailService.deleteDetailsByWorkoutId(workout.id);
        } else if (type === "ROUTINE" && routineId) {
          await routineDetailService.deleteDetailsByRoutineId(routineId);
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
  }, [type, workout?.id, routineId, router, setWorkout, openModal, showError]);

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
  }, [pathname, isModalOpen, isBottomSheetOpen, router]);

  const contextValue = useMemo(
    () => ({
      sessionGroup: workoutGroups,
      type,
      updateDetailInGroups,
      removeMultipleDetailsInGroup,
      addDetailToGroup,
      removeDetailFromGroup,
      updateMultipleDetailsInGroups,
      reorderExerciseOrderAfterDelete,
      reorderSetOrderAfterDelete,
      reload,
    }),
    [
      workoutGroups,
      type,
      updateDetailInGroups,
      removeMultipleDetailsInGroup,
      addDetailToGroup,
      removeDetailFromGroup,
      updateMultipleDetailsInGroups,
      reorderExerciseOrderAfterDelete,
      reorderSetOrderAfterDelete,
      reload,
    ]
  );

  if (isLoading) return null;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <SessionDataContext.Provider value={contextValue}>
      <div>
        {workoutGroups.length !== 0 ? (
          <>
            {(formattedDate || type === "ROUTINE") && (
              <SessionHeader
                formattedDate={formattedDate}
                handleDeleteAll={handleDeleteAll}
                handleOpenSequenceSheet={handleOpenSequenceSheet}
              />
            )}

            {/* 총 볼륨 */}
            {workoutGroups.length > 0 && (
              <div className="bg-bg-surface rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted">총 볼륨</span>
                  <span className="text-lg font-semibold">
                    {totalCurrentVolume.toLocaleString()}
                    {weightUnit}
                  </span>
                </div>
              </div>
            )}

            <ul className="flex flex-col gap-2.5 scrollbar-none">
              {workoutGroups.map(({ exerciseOrder, details }) => (
                <SessionExerciseGroup
                  key={`${exerciseOrder}-${details[0]?.exerciseId}`}
                  details={details}
                  occurrence={occurrenceData.get(exerciseOrder)}
                  exerciseOrder={exerciseOrder}
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
    </SessionDataContext.Provider>
  );
};

export default SessionContainer;
