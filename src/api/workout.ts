import { BASE_URL } from "@/constants";
import { PostWorkoutDetailInput } from "@/types/dto/workoutDetail.dto";

export const postWorkoutDetail = async (
  postWorkoutDetailInput: PostWorkoutDetailInput
) => {
  const res = await fetch(`${BASE_URL}/api/workout/detail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postWorkoutDetailInput),
  });
  if (!res.ok) {
    throw new Error("워크아웃 추가에 실패했습니다");
  }
};
