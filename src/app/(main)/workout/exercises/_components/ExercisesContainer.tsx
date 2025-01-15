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

function ExercisesContainer() {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedExerciseType, setSelectedExerciseType] =
    useState<ExerciseType>("전체");

  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");
  const debouncedKeyword = useDebounce(searchKeyword, 300);
  const { data } = useExercisesQuery(
    debouncedKeyword,
    selectedExerciseType,
    selectedCategory
  );
  console.log(data);

  const handleSearchKeyword = (keyword: string) => setSearchKeyword(keyword);

  const handleChangeSelectedExerciseType = (exerciseType: ExerciseType) =>
    setSelectedExerciseType(exerciseType);

  const handleChangeSelectedCategory = (category: Category) =>
    setSelectedCategory(category);

  console.log(`[${selectedExerciseType},${selectedCategory}]`);
  console.log(searchKeyword);
  return (
    <>
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
      {data && <ExerciseList exercises={data} />}
    </>
  );
}

export default ExercisesContainer;
