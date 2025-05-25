import { getNewRoutineDetails } from "@/adapter/routineDetail.adapter";
import { db } from "@/lib/db";
import { LocalRoutineDetail } from "@/types/models";

export type NewRoutineDetailInput = {
  routineId: number;
  startOrder: number;
};

export async function addLocalRoutineDetailsByWorkoutId(
  routineId: number,
  startOrder: number,
  selectedExercises: { id: number; name: string }[]
): Promise<number> {
  if (startOrder === null) {
    // startOrder = await getStartExerciseOrder(workoutId); // workoutId가 temp인경우 startOrder는 1
  }
  const newDetails = getNewRoutineDetails(selectedExercises, {
    routineId,
    startOrder,
  });
  const routineDetails = await db.routineDetails.bulkAdd(newDetails);

  return routineDetails;
}

export const getLocalRoutineDetails = async (
  routineId: number
): Promise<LocalRoutineDetail[]> => {
  // routineId로 db에서 가져오기
  console.log(routineId);
  const details = await db.routineDetails
    .where("routineId")
    .equals(routineId)
    .toArray();
  if (!details) throw new Error("routineId를 가져오지 못했습니다");
  return details;
};
// routineDetails db만들고 세팅
