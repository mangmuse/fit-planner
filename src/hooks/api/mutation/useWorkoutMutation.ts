import {
  deleteWorkoutDetail,
  postWorkoutDetail,
  postWorkoutDetails,
} from "@/api/workout.api";
import { QUERY_KEY } from "@/hooks/api/constants";
import {
  PostWorkoutDetailInput,
  PostWorkoutDetailsInput,
} from "@/types/dto/workoutDetail.dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useWorkoutMutation(
  userId: string | undefined,
  date: string | undefined
) {
  const queryClient = useQueryClient();
  const { mutateAsync: addWorkoutDetails } = useMutation({
    mutationFn: (postWorkoutDetailsInput: PostWorkoutDetailsInput) =>
      postWorkoutDetails(postWorkoutDetailsInput),
  });

  const { mutateAsync: addWorkoutDetail } = useMutation({
    mutationFn: (postWorkoutDetailInput: PostWorkoutDetailInput) =>
      postWorkoutDetail(postWorkoutDetailInput),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.WORKOUT_DETAILS, { userId, date }],
      }),
  });
  const { mutateAsync: removeWorkoutDetail } = useMutation({
    mutationFn: (workoutDetailId: string) =>
      deleteWorkoutDetail(workoutDetailId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.WORKOUT_DETAILS, { userId, date }],
      }),
  });

  return { addWorkoutDetails, addWorkoutDetail, removeWorkoutDetail };
}
