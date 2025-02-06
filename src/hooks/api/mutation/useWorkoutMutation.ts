import {
  deleteWorkoutDetail,
  postWorkoutDetail,
  postWorkoutDetails,
} from "@/api/workout";
import {
  PostWorkoutDetailInput,
  PostWorkoutDetailsInput,
} from "@/types/dto/workoutDetail.dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useWorkoutMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync: addWorkoutDetails } = useMutation({
    mutationFn: (postWorkoutDetailsInput: PostWorkoutDetailsInput) =>
      postWorkoutDetails(postWorkoutDetailsInput),
  });

  const { mutateAsync: addWorkoutDetail } = useMutation({
    mutationFn: (postWorkoutDetailInput: PostWorkoutDetailInput) =>
      postWorkoutDetail(postWorkoutDetailInput),
    // onSuccess: queryClient.invalidateQueries
  });
  const { mutateAsync: removeWorkoutDetail } = useMutation({
    mutationFn: (workoutDetailId: string) =>
      deleteWorkoutDetail(workoutDetailId),
    // onSuccess: queryClient.invalidateQueries
  });

  return { addWorkoutDetails, addWorkoutDetail, removeWorkoutDetail };
}
