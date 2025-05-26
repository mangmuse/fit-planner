"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import addButton from "public/add.svg";
import { Category, ExerciseType } from "@/types/filters";

import { syncExercisesFromServerLocalFirst } from "@/services/exercise.service";
import { getFilteredExercises } from "./_utils/getFilteredExercises";

import { useDebounce } from "@/hooks/useDebounce";
import { getFormattedDateYMD } from "@/util/formatDate";
import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
} from "@/types/models";
import ExerciseFilter from "@/app/(main)/workout/[date]/exercises/_components/ExerciseFilter";
import SearchBar from "@/app/(main)/workout/[date]/exercises/_components/SearchBar";
import ExerciseList from "@/app/(main)/workout/[date]/exercises/_components/ExerciseList";
import {
  addLocalWorkoutDetailsByUserDate,
  addLocalWorkoutDetailsByWorkoutId,
  deleteWorkoutDetails,
} from "@/services/workoutDetail.service";
import { getAllLocalExercises } from "@/services/exercise.service";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { useNavigationStore } from "@/__mocks__/src/store/useNavigationStore";
import {
  addLocalRoutineDetailsByWorkoutId,
  deleteRoutineDetails,
  getLocalRoutineDetails,
} from "@/services/routineDetail.service";
import { isWorkoutDetails } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import useLoadDetails from "@/hooks/useLoadDetails";

type ExercisesContainerProps = {
  type: "ROUTINE" | "RECORD";
  routineId?: number;
  allowMultipleSelection?: boolean;
  currentDetails?: LocalWorkoutDetail[] | LocalRoutineDetail[];
  reloadDetails?: () => Promise<void>;
};

export default function ExercisesContainer({
  type,
  allowMultipleSelection,
  currentDetails,
  reloadDetails,
}: ExercisesContainerProps) {
  console.log("type =>", type);
  const { data: session } = useSession();
  // const { routineId, setRoutineId, prevRoute, reset } = useNavigationStore();
  const { routineId } = useParams();
  const { closeBottomSheet } = useBottomSheet();

  const router = useRouter();
  const { date } = useParams<{ date?: string }>();
  const userId = session?.user?.id;
  const { reload } = useLoadDetails({
    type,
    userId: userId ?? "",
    date,
    routineId: routineId ? Number(routineId) : undefined,
  });

  const [exercises, setExercises] = useState<LocalExercise[]>([]);
  const [visibleExercises, setVisibleExercises] = useState<LocalExercise[]>([]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedExerciseType, setSelectedExerciseType] =
    useState<ExerciseType>("전체");
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");
  const debouncedKeyword = useDebounce(searchKeyword, 500);

  const [selectedExercises, setSelectedExercises] = useState<
    { id: number; name: string }[]
  >([]);

  async function loadLocalExerciseData() {
    const all = await getAllLocalExercises();
    setExercises(all);
  }

  const handleAddDetail = async () => {
    console.log("이거맞지요?>");
    if (type === "RECORD" && userId && date) {
      await addLocalWorkoutDetailsByUserDate(userId, date, selectedExercises);
      router.push(`/workout/${date}`);
    } else {
      if (!routineId) return;

      // routineId로 맞는 detail찾아서 몇개인지 확인해서 startOrder 가져오기
      const details = await getLocalRoutineDetails(Number(routineId));
      const startOrder = details.length + 1;

      await addLocalRoutineDetailsByWorkoutId(
        Number(routineId),
        startOrder,
        selectedExercises
      );
      router.push(`/routines/${routineId}`);
    }
  };

  const handleSearchKeyword = (kw: string) => setSearchKeyword(kw);
  const handleChangeSelectedExerciseType = (t: ExerciseType) =>
    setSelectedExerciseType(t);
  const handleChangeSelectedCategory = (c: Category) => setSelectedCategory(c);

  const handleAddSelectedExercise = (exercise: LocalExercise) => {
    if (!exercise.id || !exercise.name) return;

    if (!allowMultipleSelection) {
      setSelectedExercises([{ id: exercise.id, name: exercise.name }]);
      return;
    }

    setSelectedExercises((prev) => [
      ...prev,
      { id: exercise.id!, name: exercise.name },
    ]);
  };
  const handleDeleteSelectedExercise = (id: number) => {
    setSelectedExercises((prev) => prev.filter((item) => item.id !== id));
  };

  // 새로 선택한 운동들을 기존 운동의 exerciseOrder를 startOrder로 하여 생성
  // 기존운동 삭제
  const handleReplaceExercise = async () => {
    console.log(reloadDetails);
    try {
      if (!currentDetails || currentDetails.length === 0) return;
      console.log("hello");
      if (isWorkoutDetails(currentDetails)) {
        const { exerciseOrder: startOrder, workoutId } = currentDetails[0];
        await addLocalWorkoutDetailsByWorkoutId(
          workoutId,
          startOrder,
          selectedExercises
        );

        await deleteWorkoutDetails(currentDetails);
      } else {
        const { exerciseOrder: startOrder, routineId } = currentDetails[0];
        await addLocalRoutineDetailsByWorkoutId(
          routineId,
          startOrder,
          selectedExercises
        );

        await deleteRoutineDetails(currentDetails);
      }
      await reloadDetails?.();
      closeBottomSheet();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    (async () => {
      if (!userId) return;

      const localAll = await getAllLocalExercises();
      if (localAll.length === 0) {
        await syncExercisesFromServerLocalFirst(userId);
      }
      loadLocalExerciseData();
    })();

    // return () => reset();
  }, [userId]);

  useEffect(() => {
    const filtered = getFilteredExercises(
      exercises,
      debouncedKeyword,
      selectedExerciseType,
      selectedCategory
    );
    setVisibleExercises(filtered);
  }, [exercises, debouncedKeyword, selectedExerciseType, selectedCategory]);

  const buttonLabel = allowMultipleSelection
    ? `${selectedExercises.length}개 선택 완료`
    : "교체하기";

  return (
    <main>
      <div className="flex justify-end mt-4 mb-3">
        <Image src={addButton} alt="추가하기" />
      </div>
      <SearchBar onChange={handleSearchKeyword} keyword={searchKeyword} />
      <ExerciseFilter
        handleChangeSelectedExerciseType={handleChangeSelectedExerciseType}
        handleChangeSelectedCategory={handleChangeSelectedCategory}
        selectedExerciseType={selectedExerciseType}
        selectedCategory={selectedCategory}
      />

      {userId && visibleExercises.length > 0 && (
        <ExerciseList
          exercises={visibleExercises}
          selectedExercises={selectedExercises}
          onAdd={handleAddSelectedExercise}
          onDelete={handleDeleteSelectedExercise}
          onReload={loadLocalExerciseData}
        />
      )}

      {selectedExercises.length > 0 && (
        <button
          onClick={
            allowMultipleSelection ? handleAddDetail : handleReplaceExercise
          }
          className="fixed left-1/2 -translate-x-1/2 bottom-8 w-[330px] h-[47px] bg-primary text-text-black font-bold rounded-2xl shadow-xl"
        >
          {buttonLabel}
        </button>
      )}
    </main>
  );
}
