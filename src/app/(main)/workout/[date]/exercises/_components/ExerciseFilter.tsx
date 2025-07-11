"use client";

import { Category, ExerciseType } from "@/types/filters";
import CategoryFilter from "./CategoryFilter";
import TypeFilter from "./TypeFilter";

type ExerciseFilterProps = {
  handleChangeSelectedExerciseType: (exerciseType: ExerciseType) => void;
  handleChangeSelectedCategory: (category: Category) => void;
  selectedExerciseType: ExerciseType;
  selectedCategory: Category;
};

const ExerciseFilter = ({
  handleChangeSelectedCategory,
  handleChangeSelectedExerciseType,
  selectedExerciseType,
  selectedCategory,
}: ExerciseFilterProps) => {
  return (
    <div className="flex flex-col mt-4">
      <TypeFilter
        onClick={handleChangeSelectedExerciseType}
        selectedExerciseType={selectedExerciseType}
      />
      <div className="mt-2">
        <CategoryFilter
          onClick={handleChangeSelectedCategory}
          selectedCategory={selectedCategory}
        />
      </div>
    </div>
  );
};

export default ExerciseFilter;
