import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/hooks/api/constants";
import { getAllExercises } from "@/api/exercise";
import { Category, ExerciseType } from "@/types/filters";

export const useExercisesQuery = (
  keyword: string,
  exerciseType: ExerciseType,
  category: Category
) => {
  return useQuery({
    queryKey: [QUERY_KEY.EXERCISES, keyword, exerciseType, category],
    queryFn: () => getAllExercises(keyword, exerciseType, category),
    placeholderData: keepPreviousData,
  });
};
