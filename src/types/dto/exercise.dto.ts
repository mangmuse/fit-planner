import { Category, ExerciseType } from "@/types/filters";
import { ClientExerise, ClientUser } from "@/types/models";

export type PatchBookmarkInput = {
  exerciseId: ClientExerise["id"];
  isBookmarked: boolean;
};

export type ExerciseQueryParams = {
  userId: ClientUser["id"] | undefined;
  keyword: string;
  exerciseType: ExerciseType;
  category: Category;
};

export type UpdateBookmarkInput = PatchBookmarkInput & ExerciseQueryParams;
