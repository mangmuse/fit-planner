"use client";

import Image from "next/image";
import addButton from "public/add.svg";
import { Category, ExerciseType } from "@/types/filters";
import { useState } from "react";
import ExerciseList from "@/app/(main)/workout/exercises/_components/ExerciseList";
import ExerciseFilter from "@/app/(main)/workout/exercises/_components/ExerciseFilter";
import SearchBar from "@/app/(main)/workout/exercises/_components/SearchBar";
import { useExercisesQuery } from "@/hooks/api/query/useExercisesQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { ClientExerise } from "@/types/models";
import { useSession } from "next-auth/react";
import { PostWorkoutDetailInput } from "@/types/dto/workoutDetail.dto";
import useWorkoutMutation from "@/hooks/api/mutation/useWorkoutMutation";

function ExercisesContainer() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedExerciseType, setSelectedExerciseType] =
    useState<ExerciseType>("전체");

  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");
  const debouncedKeyword = useDebounce(searchKeyword, 1000);

  const [selectedExercises, setSelectedExercises] = useState<
    ClientExerise["id"][]
  >([]);
  const handleAddSelectedExercise = (newId: ClientExerise["id"]) =>
    setSelectedExercises((prev) => [...prev, newId]);

  const handleDeleteSelectedExercise = (toBeDeleted: ClientExerise["id"]) =>
    setSelectedExercises((prev) => prev.filter((item) => item !== toBeDeleted));

  const queryOptions = {
    userId,
    keyword: debouncedKeyword,
    exerciseType: selectedExerciseType,
    category: selectedCategory,
  };
  const { data } = useExercisesQuery({
    ...queryOptions,
  });

  const { addWorkoutDetail } = useWorkoutMutation();

  const handleSearchKeyword = (keyword: string) => setSearchKeyword(keyword);

  const handleChangeSelectedExerciseType = (exerciseType: ExerciseType) =>
    setSelectedExerciseType(exerciseType);

  const handleChangeSelectedCategory = (category: Category) =>
    setSelectedCategory(category);

  const handleAddWorkoutDetail = async () => {
    const today = new Date();
    const date = today.toISOString();

    const postWorkoutDetailInput: PostWorkoutDetailInput = {
      selectedExercises,
      userId,
      date,
    };
    await addWorkoutDetail(postWorkoutDetailInput);
  };

  return (
    <main className="">
      <div className="flex justify-end mt-[53px] mb-3">
        <Image src={addButton} alt="추가하기" />
      </div>
      <SearchBar onChange={handleSearchKeyword} keyword={searchKeyword} />
      <ExerciseFilter
        handleChangeSelectedExerciseType={handleChangeSelectedExerciseType}
        handleChangeSelectedCategory={handleChangeSelectedCategory}
        selectedExerciseType={selectedExerciseType}
        selectedCategory={selectedCategory}
      />
      {data && userId && (
        <ExerciseList
          userId={userId}
          selectedExercises={selectedExercises}
          queryOptions={queryOptions}
          onAdd={handleAddSelectedExercise}
          onDelete={handleDeleteSelectedExercise}
          exercises={data}
        />
      )}

      {selectedExercises.length > 0 && (
        <button
          onClick={handleAddWorkoutDetail}
          className="fixed left-1/2 -translate-x-1/2 bottom-8 shadow-xl w-[330px] h-[47px] font-bold rounded-2xl bg-primary text-text-black"
        >
          {selectedExercises.length}개 선택 완료
        </button>
      )}
    </main>
  );
}

export default ExercisesContainer;
