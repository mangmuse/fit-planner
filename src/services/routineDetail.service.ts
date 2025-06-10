import {
  convertLocalRoutineDetailsToServer,
  getAddSetToRoutineByLastSet,
  getNewRoutineDetails,
} from "@/adapter/routineDetail.adapter";
import {
  fetchRoutineDetailsFromServer,
  postRoutineDetailsToServer,
} from "@/api/routineDetail.api";
import { db } from "@/lib/db";
import { getExerciseWithServerId } from "@/services/exercise.service";
import { getRoutineByServerId } from "@/services/routine.service";
import { ClientRoutineDetail, LocalRoutineDetail } from "@/types/models";

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

export const addLocalRoutineDetail = async (
  routineDetailInput: LocalRoutineDetail
): Promise<void> => {
  await db.routineDetails.add(routineDetailInput);
};

export const getLocalRoutineDetails = async (
  routineId: number
): Promise<LocalRoutineDetail[]> => {
  // routineId로 db에서 가져오기
  const details = await db.routineDetails
    .where("routineId")
    .equals(routineId)
    .toArray();
  if (!details) throw new Error("routineId를 가져오지 못했습니다");
  return details;
};
// routineDetails db만들고 세팅

export const addSetToRoutine = async (
  lastSet: LocalRoutineDetail
): Promise<number> => {
  const addSetInput = getAddSetToRoutineByLastSet(lastSet);
  const newSet = await db.routineDetails.add(addSetInput);
  return newSet;
};

export const deleteRoutineDetail = async (detailId: number): Promise<void> => {
  db.routineDetails.delete(detailId);
};

export const deleteRoutineDetails = async (
  details: LocalRoutineDetail[]
): Promise<void> => {
  Promise.all(
    details.map(async (detail) => {
      if (!detail.id) throw new Error("id가 없습니다");
      await db.routineDetails.delete(detail.id);
    })
  );
};

export const updateLocalRoutineDetail = async (
  updateWorkoutInput: Partial<LocalRoutineDetail>
): Promise<void> => {
  if (!updateWorkoutInput.id) throw new Error("id가 없습니다");
  await db.routineDetails.update(updateWorkoutInput.id, updateWorkoutInput);
};

export const syncToServerRoutineDetails = async (): Promise<void> => {
  // syncToServerRoutine 가 완료된 후에 호출되어야 함

  const all = await db.routineDetails.toArray();

  const unsynced = all.filter((detail) => !detail.isSynced);
  const mappedUnsynced = await convertLocalRoutineDetailsToServer(unsynced);

  const data = await postRoutineDetailsToServer(mappedUnsynced);

  if (data.updated) {
    for (const updated of data.updated) {
      const exercise = await getExerciseWithServerId(updated.exerciseId);
      const routine = await getRoutineByServerId(updated.routineId);
      await db.routineDetails.update(updated.localId, {
        serverId: updated.serverId,
        isSynced: true,
        exerciseId: exercise?.id,
        routineId: routine?.id,
      });
    }
  }
};

export const cloneRoutineDetailWithNewRoutineId = async (
  originalDetail: LocalRoutineDetail,
  newRoutineId: number
) => {
  const { id, createdAt, updatedAt, serverId, isSynced, routineId, ...rest } =
    originalDetail;
  const newDetailInput: LocalRoutineDetail = {
    ...rest,
    routineId: newRoutineId,
    serverId: null,
    isSynced: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.routineDetails.add(newDetailInput);
};

export const overwriteWithServerRoutineDetails = async (
  userId: string
): Promise<void> => {
  const serverData: ClientRoutineDetail[] =
    await fetchRoutineDetailsFromServer(userId);

  const toInsert = await Promise.all(
    serverData.map(async (data) => {
      const exercise = await getExerciseWithServerId(data.exerciseId);
      const routine = await getRoutineByServerId(data.routineId);

      if (!exercise?.id || !routine?.id) {
        throw new Error(
          "exerciseId 또는 routineId가 일치하는 데이터를 찾을 수 없습니다"
        );
      }

      return {
        ...data,
        id: undefined,
        serverId: data.id,
        isSynced: true,
        exerciseId: exercise.id,
        routineId: routine.id,
      };
    })
  );
  await db.routineDetails.clear();
  await db.routineDetails.bulkAdd(toInsert);
};
