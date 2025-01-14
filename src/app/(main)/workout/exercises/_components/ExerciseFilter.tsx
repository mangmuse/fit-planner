"use client";

import { useState } from "react";
import CategoryFilter from "./CategoryFilter";
import TypeFilter from "./TypeFilter";
import { Category, ExerciseType } from "@/types/filters";

const ExerciseFilter = () => {
  const [selectedExerciseType, setSelectedExerciseType] =
    useState<ExerciseType>("전체");
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");

  const handleChangeSelectedExerciseType = (exerciseType: ExerciseType) =>
    setSelectedExerciseType(exerciseType);

  const handleChangeSelectedCategory = (category: Category) =>
    setSelectedCategory(category);

  console.log(`[${selectedExerciseType},${selectedCategory}]`);
  console.log();
  return (
    <div className="flex flex-col  mt-4">
      <TypeFilter
        onClick={handleChangeSelectedExerciseType}
        selectedExerciseType={selectedExerciseType}
      />
      <CategoryFilter
        onClick={handleChangeSelectedCategory}
        selectedCategory={selectedCategory}
      />
    </div>
  );
};

export default ExerciseFilter;
