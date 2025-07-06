"use client";
import swapIcon from "public/swap.svg";
import memoIcon from "public/memo.svg";
import deleteIcon from "public/delete.svg";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
  Saved,
} from "@/types/models";
import { useModal } from "@/providers/contexts/ModalContext";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import ExercisesContainer from "@/app/(main)/workout/[date]/exercises/_components/ExercisesContainer";
import { isWorkoutDetails } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import {
  exerciseService,
  routineDetailService,
  workoutDetailService,
} from "@/lib/di";
import ExerciseMemo from "@/app/(main)/_shared/session/exerciseMemo/ExerciseMemo";
import GroupOptionItem from "@/app/(main)/_shared/session/exerciseGroup/GroupOptionItem";

type SessionDetailGroupOptions = {
  exercise: Saved<LocalExercise>;
  details: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[];

  loadExercises: () => Promise<void>;
  reload: () => Promise<void>;
  reorderAfterDelete: (deletedExerciseOrder: number) => Promise<void>;
};

const units = ["kg", "lbs"] as const;

const SessionDetailGroupOptions = ({
  exercise,
  details,
  loadExercises,
  reload,
  reorderAfterDelete,
}: SessionDetailGroupOptions) => {
  const [unit, setUnit] = useState<(typeof units)[number]>(
    exercise.unit || "kg"
  );
  const { closeBottomSheet, openBottomSheet } = useBottomSheet();
  const { openModal, showError } = useModal();
  const isMounted = useRef(false);

  const handleOpenMemo = () => {
    closeBottomSheet();
    openModal({
      type: "generic",
      children: (
        <ExerciseMemo loadExercises={loadExercises} exercise={exercise} />
      ),
    });
  };

  const deleteAndLoadDetails = async () => {
    try {
      console.log("[SessionDetailGroupOptions] 삭제할 details:", {
        count: details.length,
        exerciseOrder: details[0]?.exerciseOrder,
        details: details.map((d) => ({
          id: d.id,
          exerciseId: d.exerciseId,
          exerciseName: d.exerciseName,
          exerciseOrder: d.exerciseOrder,
          setOrder: d.setOrder,
        })),
      });

      if (isWorkoutDetails(details)) {
        await workoutDetailService.deleteWorkoutDetails(details);
      } else {
        await routineDetailService.deleteRoutineDetails(details);
      }
      await reorderAfterDelete(details[0].exerciseOrder);
      await reload();
    } catch (e) {
      console.error(
        "[SessionDetailGroupOptions] deleteAndLoadDetails Error",
        e
      );
      showError("운동 삭제에 실패했습니다");
    }
  };

  const handleOpenDeleteConfirmModal = () => {
    closeBottomSheet();
    openModal({
      type: "confirm",
      title: exercise.name,
      message: "정말로 삭제하시겠습니까?",
      onConfirm: deleteAndLoadDetails,
    });
  };

  const handleOpenExercisesBottomSheet = () => {
    closeBottomSheet();
    openBottomSheet({
      height: "100dvh",
      rounded: false,
      children: (
        <ExercisesContainer
          type={isWorkoutDetails(details) ? "RECORD" : "ROUTINE"}
          currentDetails={details}
          allowMultipleSelection={false}
          reloadDetails={reload}
        />
      ),
    });
  };

  const updateUnit = async () => {
    try {
      await exerciseService.updateLocalExercise({ ...exercise, unit });
      await loadExercises();
    } catch (e) {
      console.error("[SessionDetailGroupOptions] updateUnit Error", e);
      showError("단위 변경에 실패했습니다");
    }
  };

  useEffect(() => {
    if (!loadExercises) return;
    if (isMounted.current) {
      updateUnit();
    }
    isMounted.current = true;
  }, [unit]);

  return (
    <div className="flex flex-col ">
      <h3 className="self-center">{exercise?.name}</h3>
      <nav className="relative mt-6 w-48 h-12 self-center bg-[#444444] rounded-2xl">
        <motion.div
          className="absolute top-1/2  w-20 h-9 bg-primary rounded-lg "
          initial={{ x: unit === "kg" ? "10%" : "130%", y: "-50%" }}
          animate={{ x: unit === "kg" ? "10%" : "130%", y: "-50%" }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
        {units.map((u, idx) => (
          <button
            key={idx}
            className={clsx(
              "relative w-1/2 h-full  transition-colors duration-300 ease-in-out",
              {
                "text-black  font-semibold": unit === u,
                "text-white": unit !== u,
              }
            )}
            onClick={() => setUnit(u)}
          >
            {u}
          </button>
        ))}
      </nav>
      <ul className="mt-7">
        <GroupOptionItem
          onClick={handleOpenExercisesBottomSheet}
          exercise={exercise}
          imgSrc={swapIcon}
          label="운동 교체"
        />
        <GroupOptionItem
          onClick={handleOpenMemo}
          exercise={exercise}
          imgSrc={memoIcon}
          label="메모 남기기"
        />
        <GroupOptionItem
          onClick={handleOpenDeleteConfirmModal}
          exercise={exercise}
          imgSrc={deleteIcon}
          className="text-warning"
          label="삭제하기"
          showArrow={false}
          showBottomBorder
        />
      </ul>
    </div>
  );
};

export default SessionDetailGroupOptions;
