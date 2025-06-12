import { CATEGORY_LIST, EXERCISETYPELIST } from "@/constants/filters";

export type Category = (typeof CATEGORY_LIST)[number];
export type ExerciseType = (typeof EXERCISETYPELIST)[number];
