// import { keepPreviousData, useQuery } from "@tanstack/react-query";
// import { QUERY_KEY } from "@/hooks/api/constants";
// import { ExerciseQueryParams } from "@/types/dto/exercise.dto";

// export const useExercisesQuery = ({
//   userId,
//   keyword,
//   category,
//   exerciseType,
// }: ExerciseQueryParams) => {
//   return useQuery({
//     queryKey: [QUERY_KEY.EXERCISES, userId, keyword, exerciseType, category],
//     queryFn: () => getAllExercises(userId, keyword, exerciseType, category),
//     enabled: Boolean(userId),
//     placeholderData: keepPreviousData,
//   });
// };
