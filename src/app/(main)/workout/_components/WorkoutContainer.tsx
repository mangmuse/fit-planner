"use client";

import WorkoutPlaceholder from "@/app/(main)/workout/_components/WorkoutPlaceholder";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import sortIcon from "public/sort.svg";
import trashIcon from "public/trash.svg";

import useLoadDetails from "@/hooks/useLoadDetails";

import { useModal } from "@/providers/contexts/ModalContext";
import ErrorState from "@/components/ErrorState";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
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
import { LocalWorkout } from "@/types/models";
import WorkoutExerciseGroup from "@/app/(main)/workout/_components/exerciseGroup/WorkoutExerciseGroup";
import WorkoutSequence from "@/app/(main)/workout/_components/workoutSequence/WorkoutSequence";
import LoadPastWorkoutSheet from "@/app/(main)/workout/_components/pastWorkout/LoadPastWorkoutSheet";

type WorkoutContainerProps = {
  type: "ROUTINE" | "RECORD";
  routineId?: number;
  date?: string;
  formattedDate?: string | React.ReactNode;
};

const WorkoutContainer = ({
  type,
  date,
  routineId,
  formattedDate,
}: WorkoutContainerProps) => {
  const userId = useSession().data?.user?.id;
  const {
    error,
    isLoading,
    workoutGroups,
    reload,
    workout,
    allDetails,
    setAllDetails,
    setWorkout,
  } = useLoadDetails({
    type,
    userId: userId ?? "",
    date,
    routineId,
  });
  const { openBottomSheet, isOpen: isBottomSheetOpen } = useBottomSheet();
  const { openModal, isOpen: isModalOpen, showError } = useModal();
  const router = useRouter();
  const pathname = usePathname();
  const handleOpenLocalWorkoutSheet = () => {
    openBottomSheet({
      height: "100dvh",
      rounded: false,
      children: (
        <LoadPastWorkoutSheet
          type={type}
          routineId={routineId}
          startExerciseOrder={workoutGroups.length + 1}
          date={date}
          reload={reload}
        />
      ),
    });
  };

  const reorderAfterDelete = async (
    deletedExerciseOrder: number
  ): Promise<void> => {
    try {
      // 1. 삭제한 세트 제외한 나머지 중 exerciseOrder가 큰 것들만 필터링
      const affectedDetails = allDetails.filter(
        (d) => d.exerciseOrder > deletedExerciseOrder
      );
      // 2. exerciseOrder를 1씩 감소시키면서 DB 업데이트
      const details = await Promise.all(
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
      console.error("[WorkoutContainer] Error", e);
      showError("운동 상태를 동기화하는 데 실패했습니다");
    }
  };

  const handleDeleteAll = async () => {
    try {
      async function deleteAll() {
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
        }
        router.push("/");
        setWorkout(null);
      }
      openModal({
        type: "confirm",
        title: "운동 전체 삭제",
        message: "모든 운동을 삭제하시겠습니까?",
        onConfirm: async () => deleteAll(),
      });
    } catch (e) {
      console.error("[WorkoutContainer] Error", e);
      showError("운동 전체 삭제에 실패했습니다");
    }
  };

  const handleCompleteWorkout = async () => {
    try {
      if (type !== "RECORD") return;
      if (!workout?.id) {
        console.error("Workout을 찾을 수 없습니다");
        return;
      }
      // workout status COMPLETED로 변경하고
      const updatedWorkout: Partial<LocalWorkout> = {
        id: workout.id,
        status: "COMPLETED",
      };
      await workoutService.updateLocalWorkout(updatedWorkout);

      // 메인메이지로 이동
      router.push("/");
    } catch (e) {
      console.error("[WorkoutContainer] Error", e);
      showError("운동 완료 처리에 실패했습니다");
    }
  };

  const handleClickCompleteBtn = () =>
    openModal({
      type: "confirm",
      title: "운동 완료",
      message: "운동을 완료하시겠습니까?",
      onConfirm: async () => handleCompleteWorkout(),
    });

  const exercisePath =
    type === "RECORD"
      ? `/workout/${date}/exercises`
      : `/routines/${routineId}/exercises`;

  // type이 record일때에는 workoutId도 전달함
  const placeholderProps =
    type === "ROUTINE"
      ? { type: "ROUTINE" as const }
      : { type: "RECORD" as const, date: date!, userId: userId! };

  useEffect(() => {
    const handlePopState = () => {
      // 모달이 열려있으면 모달 핸들러가 처리하도록 놔둠
      if (isModalOpen || isBottomSheetOpen) return;

      // 모달이 없고 workout 페이지면 홈으로
      if (pathname.startsWith("/workout")) {
        router.push("/");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname, isModalOpen]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-40">Loading...</div>
    );

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
                >
                  <Image
                    src={trashIcon}
                    alt="전체 삭제"
                    width={24}
                    height={24}
                  />
                </button>
                <button
                  onClick={() =>
                    openBottomSheet({
                      height: "100dvh",
                      children: (
                        <WorkoutSequence
                          detailGroups={workoutGroups}
                          reload={reload}
                        />
                      ),
                    })
                  }
                  className="p-2 hover:bg-bg-surface rounded-lg transition-colors"
                >
                  <Image
                    src={sortIcon}
                    alt="순서 변경"
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </div>
          )}
          <ul className="flex flex-col gap-2.5 scrollbar-none">
            {workoutGroups.map(({ exerciseOrder, details }) => (
              <WorkoutExerciseGroup
                key={`${exerciseOrder}-${details[0]?.exerciseId}`}
                details={details}
                reorderAfterDelete={reorderAfterDelete}
                exerciseOrder={exerciseOrder}
                reload={reload}
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
          <WorkoutPlaceholder reloadDetails={reload} {...placeholderProps} />
        </>
      )}
    </div>
  );
};

export default WorkoutContainer;
