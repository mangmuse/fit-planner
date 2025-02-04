import { ClientUser } from "@/types/models";
export type PostWorkoutDetailInput = {
  selectedExercises: number[];
  userId?: ClientUser["id"];
  date: string;
};
