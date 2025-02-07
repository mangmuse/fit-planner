"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import addButton from "public/add.svg";
import { Category, ExerciseType } from "@/types/filters";

import { loadExercisesFromServer, syncFromServer } from "@/api/exercise"; // 서버→로컬
import { getFilteredExercises } from "./_utils/getFilteredExercises";

import { useDebounce } from "@/hooks/useDebounce";
import { PostWorkoutDetailsInput } from "@/types/dto/workoutDetail.dto";
import useWorkoutMutation from "@/hooks/api/mutation/useWorkoutMutation";
import { getFormattedDateYMD } from "@/util/formatDate";
import { getAllLocalExercises } from "@/lib/db";
import { LocalExercise } from "@/types/models";
import ExerciseFilter from "@/app/(main)/workout/[date]/exercises/_components/ExerciseFilter";
import SearchBar from "@/app/(main)/workout/[date]/exercises/_components/SearchBar";
import ExerciseList from "@/app/(main)/workout/[date]/exercises/_components/ExerciseList";

export default function ExercisesContainer() {
  const { data: session } = useSession();
  const router = useRouter();
  const { date } = useParams();

  const userId = session?.user?.id;

  // 1) 로컬 DB
  const [exercises, setExercises] = useState<LocalExercise[]>([]);
  const [visibleExercises, setVisibleExercises] = useState<LocalExercise[]>([]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedExerciseType, setSelectedExerciseType] =
    useState<ExerciseType>("전체");
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");
  const debouncedKeyword = useDebounce(searchKeyword, 500);

  const [selectedExercises, setSelectedExercises] = useState<
    LocalExercise["id"][]
  >([]);

  async function loadLocalData() {
    const all = await getAllLocalExercises();
    setExercises(all);
  }

  useEffect(() => {
    if (!userId) return;
    syncFromServer(userId).catch(console.error);

    loadLocalData();
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

  const { addWorkoutDetails } = useWorkoutMutation(
    userId,
    date as string | undefined
  );
  const handleAddWorkoutDetail = async () => {
    const today = new Date();
    const ymd = getFormattedDateYMD(today); // 2025-02-07 등
    const postWorkoutDetailInput: PostWorkoutDetailsInput = {
      selectedExercises: selectedExercises.filter(
        (id): id is number => id !== null
      ),
      userId,
      date: ymd,
    };
    await addWorkoutDetails(postWorkoutDetailInput, {
      onSuccess: () => router.push(`/workout/${ymd}`),
    });
  };

  // Handlers
  const handleSearchKeyword = (kw: string) => setSearchKeyword(kw);
  const handleChangeSelectedExerciseType = (t: ExerciseType) =>
    setSelectedExerciseType(t);
  const handleChangeSelectedCategory = (c: Category) => setSelectedCategory(c);

  const handleAddSelectedExercise = (id: number) => {
    setSelectedExercises((prev) => [...prev, id]);
  };
  const handleDeleteSelectedExercise = (id: number) => {
    setSelectedExercises((prev) => prev.filter((item) => item !== id));
  };

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

      {userId && (
        <ExerciseList
          userId={userId}
          exercises={visibleExercises}
          selectedExercises={selectedExercises}
          onAdd={handleAddSelectedExercise}
          onDelete={handleDeleteSelectedExercise}
          onReload={loadLocalData} // (북마크 토글 후 DB 다시 load)
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
