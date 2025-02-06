import { ClientUser } from "@/types/models";
export type PostWorkoutDetailsInput = {
  selectedExercises: number[];
  userId?: ClientUser["id"];
  date: string;
};

export type PostWorkoutDetailInput = {
  workoutId: string;
  exerciseId: number;
  exerciseOrder: number;
  setOrder: number;
};
