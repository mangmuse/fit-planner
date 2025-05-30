import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";

export const isWorkoutDetails = (
  details: LocalWorkoutDetail[] | LocalRoutineDetail[]
): details is LocalWorkoutDetail[] => {
  return details.length === 0 || "workoutId" in details[0];
};

export const isWorkoutDetail = (
  detail: LocalWorkoutDetail | LocalRoutineDetail
): detail is LocalWorkoutDetail => {
  return "workoutId" in detail;
};
