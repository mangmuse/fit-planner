import { postWorkoutDetail } from "@/api/workout";
import { PostWorkoutDetailInput } from "@/types/dto/workoutDetail.dto";
import { useMutation } from "@tanstack/react-query";

export default function useWorkoutMutation() {
  const { mutateAsync: addWorkoutDetail } = useMutation({
    mutationFn: (postWorkoutDetailInput: PostWorkoutDetailInput) =>
      postWorkoutDetail(postWorkoutDetailInput),
  });
  return { addWorkoutDetail };
}
