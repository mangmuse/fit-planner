import { Category, ExerciseType } from "@/types/filters";
import { LocalExercise } from "@/types/models";

export const getFilteredExercises = (
  exercises: LocalExercise[],
  keyword: string,
  exerciseType: ExerciseType,
  category: Category
): LocalExercise[] => {
  const filterByKeyword = (exercise: LocalExercise) => {
    return exercise.name
      .replace(/\s/g, "")
      .includes(keyword.replace(/\s/g, ""));
  };

  const filterByExerciseType = (exercise: LocalExercise) => {
    if (exerciseType === "전체") return true;
    else if (exerciseType === "커스텀") {
      return exercise.isCustom;
    } else if (exerciseType === "즐겨찾기") {
      return exercise.isBookmarked;
    }
  };

  const filterByCategory = (exercise: LocalExercise) => {
    return category === "전체" ? true : exercise.category === category;
  };

  return exercises
    .filter(filterByKeyword)
    .filter(filterByExerciseType)
    .filter(filterByCategory);
};
