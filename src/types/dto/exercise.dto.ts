import { Category, ExerciseType } from "@/types/filters";
import { ClientExerise } from "@/types/models";

export type PatchBookmarkInput = {
  exerciseId: ClientExerise["id"];
  isBookmarked: boolean;
};

export type ExerciseQueryParams = {
  keyword: string;
  exerciseType: ExerciseType;
  category: Category;
};

export type UpdateBookmarkInput = PatchBookmarkInput & ExerciseQueryParams;
