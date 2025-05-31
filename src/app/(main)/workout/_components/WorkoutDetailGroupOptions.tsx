"use client";
import swapIcon from "public/swap.svg";
import memoIcon from "public/memo.svg";
import deleteIcon from "public/delete.svg";
import Image from "next/image";
import GroupOptionItem from "@/app/(main)/workout/_components/GroupOptionItem";
import arrowIcon from "public/right-arrow.svg";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  getExerciseWithLocalId,
  updateExercise,
} from "@/services/exercise.service";
import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
} from "@/types/models";
import { useModal } from "@/providers/contexts/ModalContext";
import ExerciseMemo from "@/app/(main)/workout/_components/ExerciseMemo";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import {
  addLocalWorkoutDetailsByUserDate,
  deleteWorkoutDetail,
  deleteWorkoutDetails,
} from "@/services/workoutDetail.service";
import ExercisesContainer from "@/app/(main)/workout/[date]/exercises/_components/ExercisesContainer";
import { isWorkoutDetails } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import {
  deleteRoutineDetail,
  deleteRoutineDetails,
} from "@/services/routineDetail.service";

type WorkoutDetailGroupOptions = {
  exercise: LocalExercise;
  details: LocalWorkoutDetail[] | LocalRoutineDetail[];

  loadExercises: () => Promise<void>;
  reload: () => Promise<void>;
  reorderAfterDelete: (deletedExerciseOrder: number) => Promise<void>;
};

const units = ["kg", "lbs"] as const;

const WorkoutDetailGroupOptions = ({
  exercise,
  details,
  loadExercises,
  reload,
  reorderAfterDelete,
}: WorkoutDetailGroupOptions) => {
  // 단위변환: 서버DB UserExercise 및 로컬DB exercises 테이블에 unit 컬럼 추가,
  //  로컬 detail에 unit을 추가하지않고 exercise db에 접근해서 해당 exercise의 unit을 가져오는방식,
  //  unit 상태를 현재 컴포넌트가 아닌 상위컴포넌트(WorkoutExerciseGroup) 에서 관리

  // 운동교체: 해당 운동그룹 삭제 -> 선택한 운동을 기존 exerciseOrder 로 추가
  // 메모 남기기: 메모 모달띄우기 (서버DB UserExercise 및 로컬DB exercises 테이블에 memo 컬럼 추가)
  // 삭제하기: 삭제 모달띄우기 -> 해당 workout의 exerciseOrder 일치 삭제

  // const [exercise, setExercise] = useState<LocalExercise | null>(null);
  const [unit, setUnit] = useState<(typeof units)[number]>("kg");
  const { closeBottomSheet, openBottomSheet } = useBottomSheet();
  const { openModal } = useModal();
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
    if (isWorkoutDetails(details)) {
      await deleteWorkoutDetails(details);
    } else {
      await deleteRoutineDetails(details);
    }
    await reorderAfterDelete(details[0].exerciseOrder);
    await reload();
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
    // TODO: 최대 높이가 작을경우 제대로 표기되지 않음
    openBottomSheet({
      height: "90vh",
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

  // useEffect(() => {
  //   const fetchAndSetExercise = async () => {
  //     const exerciseData = await getExerciseWithLocalId(exerciseId);
  //     if (!exerciseData) throw new Error("운동 데이터를 받아오지 못했습니다.");
  //     setExercise(exerciseData);
  //   };

  //   fetchAndSetExercise();
  // }, [exerciseId]);

  useEffect(() => {
    if (!loadExercises) return;
    const updateUnit = async () => {
      await updateExercise({ ...exercise, unit });
      await loadExercises();
    };
    updateUnit();
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

export default WorkoutDetailGroupOptions;
