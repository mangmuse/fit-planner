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
import { LocalExercise } from "@/types/models";
import ExerciseFilter from "@/app/(main)/workout/[date]/exercises/_components/ExerciseFilter";
import SearchBar from "@/app/(main)/workout/[date]/exercises/_components/SearchBar";
import ExerciseList from "@/app/(main)/workout/[date]/exercises/_components/ExerciseList";
import { addLocalWorkoutDetails } from "@/services/workoutDetail.service";
import { getAllLocalExercises } from "@/services/exercise.service";

export default function ExercisesContainer() {
  const { data: session } = useSession();
  const router = useRouter();
  const { date } = useParams();

  const userId = session?.user?.id;

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

  const handleAddWorkoutDetail = async () => {
    if (!userId) return;
    const today = new Date();
    const ymd = getFormattedDateYMD(today); // 2025-02-07 등

    await addLocalWorkoutDetails(userId, ymd, selectedExercises);

    router.push(`/workout/${date}`);
  };

  const handleSearchKeyword = (kw: string) => setSearchKeyword(kw);
  const handleChangeSelectedExerciseType = (t: ExerciseType) =>
    setSelectedExerciseType(t);
  const handleChangeSelectedCategory = (c: Category) => setSelectedCategory(c);

  const handleAddSelectedExercise = (exercise: LocalExercise) => {
    if (!exercise.id || !exercise.name) return;
    setSelectedExercises((prev) => [
      ...prev,
      { id: exercise.id!, name: exercise.name },
    ]);
  };
  const handleDeleteSelectedExercise = (id: number) => {
    setSelectedExercises((prev) => prev.filter((item) => item.id !== id));
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
          onClick={handleAddWorkoutDetail}
          className="fixed left-1/2 -translate-x-1/2 bottom-8 w-[330px] h-[47px] bg-primary text-text-black font-bold rounded-2xl shadow-xl"
        >
          {selectedExercises.length}개 선택 완료
        </button>
      )}
    </main>
  );
}
