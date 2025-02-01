import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/hooks/api/constants";
import { getAllExercises } from "@/api/exercise";
import { ExerciseQueryParams } from "@/types/dto/exercise.dto";

export const useExercisesQuery = ({
  keyword,
  category,
  exerciseType,
}: ExerciseQueryParams) => {
  return useQuery({
    queryKey: [QUERY_KEY.EXERCISES, keyword, exerciseType, category],
    queryFn: () => getAllExercises(keyword, exerciseType, category),
    placeholderData: keepPreviousData,
  });
};
