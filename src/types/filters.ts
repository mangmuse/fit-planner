import { CATEGORYLIST, EXERCISETYPELIST } from "@/constants/filters";

export type Category = (typeof CATEGORYLIST)[number]; // 리터럴 타입 유니온 생성
export type ExerciseType = (typeof EXERCISETYPELIST)[number]; // 리터럴 타입 유니온 생성
