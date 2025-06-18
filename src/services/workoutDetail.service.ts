import { WorkoutDetail } from "@prisma/client";
import { LocalWorkout, LocalWorkoutDetail } from "./../types/models";
import {
  fetchWorkoutDetailsFromServer,
  postWorkoutDetailsToServer,
} from "@/api/workoutDetail.api";
import { db } from "@/lib/db";
import { workoutDetailAdapter } from "@/adapter/workoutDetail.adapter";
import { exerciseService } from "@/services/exercise.service";
import { workoutService } from "@/services/workout.service";
import { ClientWorkoutDetail, LocalRoutineDetail } from "@/types/models";
import { isWorkoutDetails } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { workoutDetailRepository } from "@/repositories/workoutDetail.repository";
import { workoutRepository } from "@/repositories/workout.repository";

export type NewWorkoutDetailInput = {
  workoutId: number;
  startOrder: number;
};

type AddWorkoutDetailsOptions = {
  workoutId?: number;
  startOrder?: number;
};

export const overwriteWithServerWorkoutDetails = async (
  userId: string
): Promise<void> => {
  const serverData: ClientWorkoutDetail[] =
    await fetchWorkoutDetailsFromServer(userId);

  const toInsert = await Promise.all(
    serverData.map(async (data) => {
      const exercise = await exerciseService.getExerciseWithServerId(
        data.exerciseId
      );

      const workout = await workoutService.getWorkoutWithServerId(
        data.workoutId
      );

      if (!exercise?.id || !workout?.id)
        throw new Error("exerciseId 또는 workoutId가 없습니다");
      return {
        ...data,
        id: undefined,
        serverId: data.id,
        isSynced: true,
        exerciseId: exercise.id,
        workoutId: workout.id,
      };
    })
  );
  await workoutDetailRepository.clear();
  await workoutDetailRepository.bulkAdd(toInsert);
};
export async function addLocalWorkoutDetailsByUserDate(
  userId: string,
  date: string,
  selectedExercises: { id: number | undefined; name: string }[]
): Promise<number> {
  try {
    const workout = await workoutService.addLocalWorkout(userId, date);
    const workoutId = workout.id!;

    const startOrder = await getStartExerciseOrder(workoutId);

    const newDetails = workoutDetailAdapter.getNewWorkoutDetails(
      selectedExercises,
      {
        workoutId,
        startOrder,
      }
    );

    const workoutDetails = await workoutDetailRepository.bulkAdd(newDetails);
    return workoutDetails;
  } catch (e) {
    throw new Error("WorkoutDetails 추가에 실패했습니다");
  }
}

export const addLocalWorkoutDetail = async (
  detailInput: LocalWorkoutDetail
): Promise<void> => {
  try {
    await workoutDetailRepository.add(detailInput);
  } catch (e) {
    throw new Error("WorkoutDetail 추가에 실패했습니다");
  }
};

async function getStartExerciseOrder(workoutId: number): Promise<number> {
  const allDetails =
    await workoutDetailRepository.findAllByWorkoutIdOrderByExerciseOrder(
      workoutId
    );
  const lastDetail = allDetails.at(-1);
  const startOrder = lastDetail ? lastDetail.exerciseOrder + 1 : 1;
  return startOrder;
}

export async function addLocalWorkoutDetailsByWorkoutId(
  workoutId: number,
  startOrder: number,
  selectedExercises: { id: number; name: string }[]
): Promise<number> {
  try {
    if (startOrder == null) {
      startOrder = await getStartExerciseOrder(workoutId);
    }
    const newDetails = workoutDetailAdapter.getNewWorkoutDetails(
      selectedExercises,
      {
        workoutId,
        startOrder,
      }
    );
    const workoutDetails = await workoutDetailRepository.bulkAdd(newDetails);

    return workoutDetails;
  } catch (e) {
    throw new Error("WorkoutDetails 추가에 실패했습니다");
  }
}

export const getLocalWorkoutDetails = async (
  userId: string,
  date: string
): Promise<LocalWorkoutDetail[]> => {
  try {
    let workout = await workoutService.getWorkoutByUserIdAndDate(userId, date);

    if (!workout) {
      workout = await workoutService.addLocalWorkout(userId, date);
    }

    if (!workout?.id) throw new Error("workoutId를 가져오지 못했습니다");

    const details = await workoutDetailRepository.findAllByWorkoutId(
      workout.id
    );

    return details;
  } catch (e) {
    throw new Error("WorkoutDetails를 불러오는 데 실패했습니다");
  }
};

export const getLocalWorkoutDetailsByWorkoutId = async (
  workoutId: number
): Promise<LocalWorkoutDetail[]> => {
  if (!workoutId) throw new Error("workoutId가 없습니다");
  try {
    const details = await workoutDetailRepository.findAllByWorkoutId(workoutId);
    return details;
  } catch (e) {
    throw new Error("WorkoutDetails를 불러오는 데 실패했습니다");
  }
};

export const getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder = async (
  workoutId: number,
  exerciseOrder: number
): Promise<LocalWorkoutDetail[]> => {
  try {
    return workoutDetailRepository.findAllByWorkoutIdAndExerciseOrder(
      workoutId,
      exerciseOrder
    );
  } catch (e) {
    throw new Error("WorkoutDetails를 불러오는 데 실패했습니다");
  }
};
export const updateLocalWorkoutDetail = async (
  updateWorkoutInput: Partial<LocalWorkoutDetail>
): Promise<void> => {
  if (!updateWorkoutInput.id) throw new Error("id가 없습니다");
  try {
    await workoutDetailRepository.update(
      updateWorkoutInput.id,
      updateWorkoutInput
    );
  } catch (e) {
    throw new Error("WorkoutDetail 업데이트에 실패했습니다");
  }
};

export const addSetToWorkout = async (
  lastSet: LocalWorkoutDetail
): Promise<number> => {
  try {
    const addSetInput =
      workoutDetailAdapter.getAddSetToWorkoutByLastSet(lastSet);
    const newSet = await workoutDetailRepository.add(addSetInput);
    return newSet;
  } catch (e) {
    throw new Error("WorkoutDetail 추가에 실패했습니다");
  }
};

export const deleteWorkoutDetail = async (lastSetId: number): Promise<void> => {
  try {
    await workoutDetailRepository.delete(lastSetId);
  } catch (e) {
    throw new Error("WorkoutDetail 삭제에 실패했습니다");
  }
};

export const deleteWorkoutDetails = async (
  details: LocalWorkoutDetail[]
): Promise<void> => {
  try {
    await Promise.all(
      details.map(async (detail) => {
        if (!detail.id) throw new Error("id가 없습니다");
        await workoutDetailRepository.delete(detail.id);
      })
    );
  } catch (e) {
    throw new Error("WorkoutDetails 삭제에 실패했습니다");
  }
};

export const syncToServerWorkoutDetails = async (): Promise<void> => {
  const all = await workoutDetailRepository.findAll();

  const unsynced = all.filter((detail) => !detail.isSynced);
  const mappedUnsynced =
    await workoutDetailAdapter.convertLocalWorkoutDetailToServer(unsynced);
  const data = await postWorkoutDetailsToServer(mappedUnsynced);

  if (data.updated.length === 0) return;

  if (data.updated) {
    for (const updated of data.updated) {
      const exercise = await exerciseService.getExerciseWithServerId(
        updated.exerciseId
      );
      const workout = await workoutService.getWorkoutWithServerId(
        updated.workoutId
      );
      await workoutDetailRepository.update(updated.localId, {
        serverId: updated.serverId,
        isSynced: true,
        exerciseId: exercise?.id,
        workoutId: workout?.id,
      });
    }
  }
};

const getAllDoneDetailsExceptCurrent = async (
  details: LocalWorkoutDetail[] | LocalRoutineDetail[]
): Promise<LocalWorkoutDetail[]> => {
  try {
    const isWorkout = isWorkoutDetails(details);
    let candidates = await workoutDetailRepository.findAllDoneByExerciseId(
      details[0].exerciseId
    );
    if (isWorkout) {
      const currentWorkoutId = details[0].workoutId;
      candidates = candidates.filter((d) => d.workoutId !== currentWorkoutId);
    }
    return candidates;
  } catch (e) {
    throw new Error("WorkoutDetails를 불러오는 데 실패했습니다");
  }
};

const pickMostRecentDetailBeforeDate = async (
  candidates: LocalWorkoutDetail[],
  referenceDate?: Date
): Promise<LocalWorkoutDetail | undefined> => {
  if (!candidates.length) return undefined;

  try {
    const workoutIdToDateMap = new Map<number, string>();
    for (const detail of candidates) {
      if (!workoutIdToDateMap.has(detail.workoutId)) {
        const w = await workoutRepository.findOneById(detail.workoutId);
        if (w?.date) {
          workoutIdToDateMap.set(detail.workoutId, w.date);
        }
      }
    }

    let filtered = candidates;
    if (referenceDate) {
      filtered = filtered.filter((d) => {
        const dateString = workoutIdToDateMap.get(d.workoutId);
        if (!dateString) return false;
        const workoutDate = new Date(dateString);
        return workoutDate <= referenceDate;
      });
    }
    if (!filtered.length) return undefined;
    filtered.sort((a, b) => {
      const dateA = workoutIdToDateMap.get(a.workoutId) || "";
      const dateB = workoutIdToDateMap.get(b.workoutId) || "";
      return dateB.localeCompare(dateA);
    });
    return filtered[0];
  } catch (e) {
    throw new Error("가장 최근 WorkoutDetail을 찾는 데 실패했습니다");
  }
};

/**
 * 주어진 details(현재 워크아웃 또는 루틴 디테일 배열)에서
 *   1. exerciseId가 같고 isDone이 true인 모든 LocalWorkoutDetail을 가져온 뒤,
 *   2. “현재 디테일이 속한 워크아웃의 날짜” 이전(혹은 같음)의 것만 남긴 다음,
 *   3. 그중 가장 최근 날짜(내림차순 정렬)인 하나를 반환
 *
 * @param details 현재 화면에 표시된 디테일 그룹 (LocalWorkoutDetail[] or LocalRoutineDetail[])
 * @returns 가장 최신인 LocalWorkoutDetail 혹은, 없으면 undefined
 */
export const getLatestWorkoutDetailByExerciseId = async (
  details: LocalWorkoutDetail[] | LocalRoutineDetail[]
): Promise<LocalWorkoutDetail | void> => {
  try {
    const isWorkout = isWorkoutDetails(details);
    const candidates = await getAllDoneDetailsExceptCurrent(details);
    if (!candidates.length) return;
    let referenceDate: Date | undefined = undefined;
    if (isWorkout) {
      const currentWorkout = await workoutRepository.findOneById(
        details[0].workoutId
      );
      if (!currentWorkout?.date) return;
      referenceDate = new Date(currentWorkout.date);
    }
    const mostRecent = await pickMostRecentDetailBeforeDate(
      candidates,
      referenceDate
    );
    return mostRecent;
  } catch (e) {
    throw new Error("가장 최근 WorkoutDetail을 찾는 데 실패했습니다");
  }
};

export const getWorkoutGroupByWorkoutDetail = async (
  detail: LocalWorkoutDetail
): Promise<LocalWorkoutDetail[]> => {
  const { exerciseOrder, workoutId } = detail;
  try {
    return workoutDetailRepository.findAllByWorkoutIdAndExerciseOrder(
      workoutId,
      exerciseOrder
    );
  } catch (e) {
    throw new Error("WorkoutDetails를 불러오는 데 실패했습니다");
  }
};

export const updateWorkoutDetails = async (
  updatedDetails: LocalWorkoutDetail[]
) => {
  try {
    await workoutDetailRepository.bulkPut(updatedDetails);
  } catch (e) {
    throw new Error("WorkoutDetails 업데이트에 실패했습니다");
  }
};
