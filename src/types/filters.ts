import { CATEGORYLIST, EXERCISETYPELIST } from "@/constants/filters";

export type Category = (typeof CATEGORYLIST)[number];
export type ExerciseType = (typeof EXERCISETYPELIST)[number];
