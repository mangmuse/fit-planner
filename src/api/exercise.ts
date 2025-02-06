import { BASE_URL } from "@/constants";
import { PatchBookmarkInput } from "@/types/dto/exercise.dto";
import { Category, ExerciseType } from "@/types/filters";
import { ClientUser } from "@/types/models";

// export const getAllExercises = async (
//   userId: ClientUser["id"] | undefined,
//   keyword: string,
//   exerciseType: ExerciseType,
//   category: Category
// ) => {
//   const queryParams = new URLSearchParams({
//     userId: userId?.toString() ?? "",
//     keyword: encodeURIComponent(keyword),
//     type: encodeURIComponent(exerciseType),
//     category: encodeURIComponent(category),
//   });

//   const res = await fetch(`${BASE_URL}/api/exercises/all?${queryParams}`);
//   if (!res.ok) {
//     throw new Error("Failed to fetch exercises");
//   }
//   return res.json();
// };
export const getAllExercises = async (userId: ClientUser["id"] | undefined) => {
  const queryParams = new URLSearchParams({
    userId: userId?.toString() ?? "",
  });

  const res = await fetch(`${BASE_URL}/api/exercises/all?${queryParams}`);
  if (!res.ok) {
    throw new Error("Failed to fetch exercises");
  }
  return res.json();
};

export const patchBookmark = async (patchBookmarkInput: PatchBookmarkInput) => {
  const res = await fetch(`${BASE_URL}/api/exercises/bookmark`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patchBookmarkInput),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch exercises");
  }
  return res.json();
};
