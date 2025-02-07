import { Category, ExerciseType } from "@/types/filters";
import { ClientExercise, ClientUser } from "@/types/models";

export type PatchBookmarkInput = {
  userId: ClientUser["id"];
  exerciseId: ClientExercise["id"];
  isBookmarked: boolean;
};

export type ExerciseQueryParams = {
  userId: ClientUser["id"] | undefined;
  keyword: string;
  exerciseType: ExerciseType;
  category: Category;
};

export type UpdateBookmarkInput = PatchBookmarkInput & ExerciseQueryParams;
