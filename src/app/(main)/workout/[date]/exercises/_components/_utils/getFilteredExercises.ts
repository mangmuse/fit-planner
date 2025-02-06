import { Category, ExerciseType } from "@/types/filters";
import { ClientExerise } from "@/types/models";

export const getFilteredExercises = (
  exercises: ClientExerise[],
  keyword: string,
  exerciseType: ExerciseType,
  category: Category
): ClientExerise[] => {
  const filterByKeyword = (exercise: ClientExerise) =>
    exercise.name.includes(keyword);

  const filterByExerciseType = (exercise: ClientExerise) => {
    if (exerciseType === "전체") return true;
    else if (exerciseType === "커스텀") {
      return exercise.isCustom;
    } else if (exerciseType === "즐겨찾기") {
      return exercise.isBookmarked;
    }
  };

  const filterByCategory = (exercise: ClientExerise) => {
    return category === "전체" ? true : exercise.category === category;
  };

  return exercises
    .filter(filterByKeyword)
    .filter(filterByExerciseType)
    .filter(filterByCategory);
};
