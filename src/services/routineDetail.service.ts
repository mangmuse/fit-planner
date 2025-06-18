import { routineDetailAdapter } from "@/adapter/routineDetail.adapter";
import {
  fetchRoutineDetailsFromServer,
  postRoutineDetailsToServer,
} from "@/api/routineDetail.api";
import { db } from "@/lib/db";
import { exerciseService } from "@/services/exercise.service";
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
  try {
    if (startOrder === null) {
      // startOrder = await getStartExerciseOrder(workoutId); // workoutId가 temp인경우 startOrder는 1
    }
    const newDetails = routineDetailAdapter.getNewRoutineDetails(
      selectedExercises,
      {
        routineId,
        startOrder,
      }
    );
    const routineDetails = await db.routineDetails.bulkAdd(newDetails);

    return routineDetails;
  } catch (e) {
    throw new Error("RoutineDetails를 추가하는 데 실패했습니다");
  }
}

export const addLocalRoutineDetail = async (
  routineDetailInput: LocalRoutineDetail
): Promise<void> => {
  try {
    await db.routineDetails.add(routineDetailInput);
  } catch (e) {
    throw new Error("RoutineDetails를 추가하는 데 실패했습니다");
  }
};

export const getLocalRoutineDetails = async (
  routineId: number
): Promise<LocalRoutineDetail[]> => {
  try {
    const details = await db.routineDetails
      .where("routineId")
      .equals(routineId)
      .toArray();
    return details;
  } catch (e) {
    throw new Error("RoutineDetails를 불러오는 데 실패했습니다");
  }
};

export const addSetToRoutine = async (
  lastSet: LocalRoutineDetail
): Promise<number> => {
  try {
    const addSetInput =
      routineDetailAdapter.getAddSetToRoutineByLastSet(lastSet);
    const newSet = await db.routineDetails.add(addSetInput);
    return newSet;
  } catch (e) {
    throw new Error("RoutineDetail을 추가하는 데 실패했습니다");
  }
};

export const deleteRoutineDetail = async (detailId: number): Promise<void> => {
  try {
    await db.routineDetails.delete(detailId);
  } catch (e) {
    throw new Error("RoutineDetail을 삭제하는 데 실패했습니다");
  }
};

export const deleteRoutineDetails = async (
  details: LocalRoutineDetail[]
): Promise<void> => {
  try {
    await Promise.all(
      details.map(async (detail) => {
        if (!detail.id) throw new Error("id가 없습니다");
        await db.routineDetails.delete(detail.id);
      })
    );
  } catch (e) {
    throw new Error("RoutineDetails를 삭제하는 데 실패했습니다");
  }
};

export const updateLocalRoutineDetail = async (
  updateWorkoutInput: Partial<LocalRoutineDetail>
): Promise<void> => {
  try {
    if (!updateWorkoutInput.id) throw new Error("id가 없습니다");
    await db.routineDetails.update(updateWorkoutInput.id, updateWorkoutInput);
  } catch (e) {
    throw new Error("RoutineDetails를 업데이트하는 데 실패했습니다");
  }
};

export const syncToServerRoutineDetails = async (): Promise<void> => {
  // syncToServerRoutine 가 완료된 후에 호출되어야 함

  const all = await db.routineDetails.toArray();

  const unsynced = all.filter((detail) => !detail.isSynced);
  const mappedUnsynced =
    await routineDetailAdapter.convertLocalRoutineDetailsToServer(unsynced);

  const data = await postRoutineDetailsToServer(mappedUnsynced);

  if (data.updated) {
    for (const updated of data.updated) {
      const exercise = await exerciseService.getExerciseWithServerId(
        updated.exerciseId
      );
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
  try {
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
  } catch (e) {
    throw new Error("RoutineDetail을 복제하는 데 실패했습니다");
  }
};

export const overwriteWithServerRoutineDetails = async (
  userId: string
): Promise<void> => {
  const serverData: ClientRoutineDetail[] =
    await fetchRoutineDetailsFromServer(userId);

  const toInsert = await Promise.all(
    serverData.map(async (data) => {
      const exercise = await exerciseService.getExerciseWithServerId(
        data.exerciseId
      );
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
