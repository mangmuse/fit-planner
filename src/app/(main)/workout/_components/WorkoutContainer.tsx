"use client";

import WorkoutSequence from "@/app/(main)/workout/_components/WorkoutSequence";
import WorkoutExerciseGroup from "@/app/(main)/workout/_components/WorkoutExerciseGroup";
import WorkoutPlaceholder from "@/app/(main)/workout/_components/WorkoutPlaceholder";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import sortIcon from "public/sort.svg";
import trashIcon from "public/trash.svg";

import useLoadDetails from "@/hooks/useLoadDetails";
import LoadPastWorkoutSheet from "@/app/(main)/workout/_components/LoadPastWorkoutSheet";
import { useModal } from "@/providers/contexts/ModalContext";
import ErrorState from "@/components/ErrorState";

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
    reorderAfterDelete,
    handleClickCompleteBtn,
    handleDeleteAll,
  } = useLoadDetails({
    type,
    userId: userId ?? "",
    date,
    routineId,
  });
  const { openBottomSheet } = useBottomSheet();
  const { openModal } = useModal();
  const handleOpenLocalWorkoutSheet = () => {
    openBottomSheet({
      height: "100vh",
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

  const exercisePath =
    type === "RECORD"
      ? `/workout/${date}/exercises`
      : `/routines/${routineId}/exercises`;

  // type이 record일때에는 workoutId도 전달함
  const placeholderProps =
    type === "ROUTINE"
      ? { type: "ROUTINE" as const }
      : { type: "RECORD" as const, date: date!, userId: userId! };

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
            <div className="flex justify-between items-center mb-6">
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
                      height: "100vh",
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
          <ul className="flex flex-col gap-2.5">
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
