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
import {
  isWorkoutDetail,
  isWorkoutDetails,
} from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { routineDetailService, workoutDetailService } from "@/lib/di";
import ExerciseMemo from "@/app/(main)/_shared/session/exerciseMemo/ExerciseMemo";
import GroupOptionItem from "@/app/(main)/_shared/session/exerciseGroup/GroupOptionItem";
import { convertKgtoLbs, convertLbstoKg } from "@/util/weightConversion";
import { useSessionData } from "@/app/(main)/_shared/session/SessionContainer";

export type SessionDetailGroupOptionsProps = {
  exercise: Saved<LocalExercise>;
  exerciseOrder: number;
  details: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[];
  loadExercises: () => Promise<void>;
  reload: () => Promise<void>;
  updateMultipleDetailsInGroups: (
    updatedDetails: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[]
  ) => void;
  removeMultipleDetailsInGroup: (
    details: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[]
  ) => void;
  reorderExerciseOrderAfterDelete: (
    deletedExerciseOrder: number
  ) => Promise<void>;
};

const units = ["kg", "lbs"] as const;

const SessionDetailGroupOptions = ({
  exercise,
  exerciseOrder,
  details,
  loadExercises,
  reload,
  updateMultipleDetailsInGroups,
  removeMultipleDetailsInGroup,
  reorderExerciseOrderAfterDelete,
}: SessionDetailGroupOptionsProps) => {
  const [unit, setUnit] = useState<(typeof units)[number]>(
    details[0]?.weightUnit || "kg"
  );
  console.log(reorderExerciseOrderAfterDelete);
  const [currentWeights, setCurrentWeights] = useState<number[]>(
    details.map((d) => d.weight || 0)
  );
  const { closeBottomSheet, openBottomSheet } = useBottomSheet();
  const { openModal, showError } = useModal();
  const isMounted = useRef(false);

  useEffect(() => {
    setCurrentWeights(details.map((d) => d.weight || 0));
  }, [details]);

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
      if (isWorkoutDetails(details)) {
        await workoutDetailService.deleteWorkoutDetails(details);
      } else {
        await routineDetailService.deleteRoutineDetails(details);
      }
      await reorderExerciseOrderAfterDelete(exerciseOrder);
      removeMultipleDetailsInGroup(details);
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

  const handleUnitChange = async (newUnit: (typeof units)[number]) => {
    if (newUnit === unit) return;

    const prevUnit = unit;

    setUnit(newUnit);

    try {
      const newWeights = currentWeights.map((weight) =>
        prevUnit === "kg" ? convertKgtoLbs(weight) : convertLbstoKg(weight)
      );

      const updatePromise = details.map((detail, index) => {
        const updatedDetail = {
          ...detail,
          weight: newWeights[index],
          weightUnit: newUnit,
        };

        if (isWorkoutDetail(detail)) {
          return workoutDetailService.updateLocalWorkoutDetail(updatedDetail);
        } else {
          return routineDetailService.updateLocalRoutineDetail(updatedDetail);
        }
      });

      await Promise.all(updatePromise);

      const updatedDetails = details.map((detail, index) => ({
        ...detail,
        weight: newWeights[index],
        weightUnit: newUnit,
      }));

      setCurrentWeights(newWeights);
      updateMultipleDetailsInGroups(updatedDetails);
    } catch (e) {
      console.error("[SessionDetailGroupOptions] handleUnitChange Error", e);
      setUnit(prevUnit);
      showError("단위 변경에 실패했습니다");
    }
  };

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
            onClick={() => handleUnitChange(u)}
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
