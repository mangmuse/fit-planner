import { BASE_URL } from "@/constants";
import { PatchBookmarkInput } from "@/types/dto/exercise.dto";
import { Category, ExerciseType } from "@/types/filters";

export const getAllExercises = async (
  keyword: string,
  exerciseType: ExerciseType,
  category: Category
) => {
  console.log("키워드", keyword);
  const queryParams = new URLSearchParams({
    keyword: encodeURIComponent(keyword),
    type: encodeURIComponent(exerciseType),
    category: encodeURIComponent(category),
  });

  const response = await fetch(`${BASE_URL}/api/exercises/all?${queryParams}`);
  if (!response.ok) {
    throw new Error("Failed to fetch exercises");
  }
  return response.json();
};

export const patchBookmark = async (patchBookmarkInput: PatchBookmarkInput) => {
  const response = await fetch(`${BASE_URL}/api/exercises/all?`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patchBookmarkInput),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch exercises");
  }
  return response.json();
};
