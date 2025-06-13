import { LocalWorkout, LocalWorkoutDetail } from "./../types/models";
import {
  fetchWorkoutDetailsFromServer,
  postWorkoutDetailsToServer,
} from "@/api/workoutDetail.api";
import { db } from "@/lib/db";
import {
  convertLocalWorkoutDetailToServer,
  getAddSetToWorkoutByLastSet,
  getNewWorkoutDetails,
  getStartExerciseOrder,
} from "@/adapter/workoutDetail.adapter";
import { getExerciseWithServerId } from "@/services/exercise.service";
import {
  addLocalWorkout,
  getWorkoutByUserIdAndDate,
  getWorkoutWithServerId,
} from "@/services/workout.service";
import { ClientWorkoutDetail, LocalRoutineDetail } from "@/types/models";
import { isWorkoutDetails } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";

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
      const exercise = await getExerciseWithServerId(data.exerciseId);

      const workout = await getWorkoutWithServerId(data.workoutId);

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
  await db.workoutDetails.clear();
  await db.workoutDetails.bulkAdd(toInsert);
};
export async function addLocalWorkoutDetailsByUserDate(
  userId: string,
  date: string,
  selectedExercises: { id: number | undefined; name: string }[]
): Promise<number> {
  const workout = await addLocalWorkout(userId, date);
  const workoutId = workout.id!;

  const startOrder = await getStartExerciseOrder(workoutId);

  const newDetails = getNewWorkoutDetails(selectedExercises, {
    workoutId,
    startOrder,
  });

  const workoutDetails = await db.workoutDetails.bulkAdd(newDetails);
  return workoutDetails;
}

export const addLocalWorkoutDetail = async (
  detailInput: LocalWorkoutDetail
): Promise<void> => {
  console.log(await db.workoutDetails.add(detailInput));
};

export async function addLocalWorkoutDetailsByWorkoutId(
  workoutId: number,
  startOrder: number,
  selectedExercises: { id: number; name: string }[]
): Promise<number> {
  if (startOrder == null) {
    startOrder = await getStartExerciseOrder(workoutId);
  }
  const newDetails = getNewWorkoutDetails(selectedExercises, {
    workoutId,
    startOrder,
  });
  const workoutDetails = await db.workoutDetails.bulkAdd(newDetails);

  return workoutDetails;
}

export const getLocalWorkoutDetails = async (
  userId: string,
  date: string
): Promise<LocalWorkoutDetail[]> => {
  let workout = await getWorkoutByUserIdAndDate(userId, date);

  if (!workout) {
    workout = await addLocalWorkout(userId, date);
  }

  if (!workout?.id) throw new Error("workoutId를 가져오지 못했습니다");

  const details = await db.workoutDetails
    .where("workoutId")
    .equals(workout.id)
    .toArray();

  return details;
};

export const getLocalWorkoutDetailsByWorkoutId = async (
  workoutId: number
): Promise<LocalWorkoutDetail[]> => {
  if (!workoutId) throw new Error("workoutId가 없습니다");
  const details = await db.workoutDetails
    .where("workoutId")
    .equals(workoutId)
    .toArray();
  return details;
};

export const getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder = async (
  workoutId: number,
  exerciseOrder: number
): Promise<LocalWorkoutDetail[]> => {
  return db.workoutDetails
    .where("workoutId")
    .equals(workoutId)
    .and((detail) => detail.exerciseOrder === exerciseOrder)
    .toArray();
};
export const updateLocalWorkoutDetail = async (
  updateWorkoutInput: Partial<LocalWorkoutDetail>
): Promise<void> => {
  if (!updateWorkoutInput.id) throw new Error("id가 없습니다");
  await db.workoutDetails.update(updateWorkoutInput.id, updateWorkoutInput);
};

export const addSetToWorkout = async (
  lastSet: LocalWorkoutDetail
): Promise<number> => {
  const addSetInput = getAddSetToWorkoutByLastSet(lastSet);
  const newSet = await db.workoutDetails.add(addSetInput);
  return newSet;
};

export const deleteWorkoutDetail = async (lastSetId: number): Promise<void> => {
  db.workoutDetails.delete(lastSetId);
};

export const deleteWorkoutDetails = async (
  details: LocalWorkoutDetail[]
): Promise<void> => {
  Promise.all(
    details.map(async (detail) => {
      if (!detail.id) throw new Error("id가 없습니다");
      await db.workoutDetails.delete(detail.id);
    })
  );
};

export const syncToServerWorkoutDetails = async (): Promise<void> => {
  const all = await db.workoutDetails.toArray();

  const unsynced = all.filter((detail) => !detail.isSynced);
  const mappedUnsynced = await convertLocalWorkoutDetailToServer(unsynced);
  const data = await postWorkoutDetailsToServer(mappedUnsynced);

  if (data.updated.length === 0) return;

  if (data.updated) {
    for (const updated of data.updated) {
      const exercise = await getExerciseWithServerId(updated.exerciseId);
      const workout = await getWorkoutWithServerId(updated.workoutId);
      await db.workoutDetails.update(updated.localId, {
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
  const isWorkout = isWorkoutDetails(details);
  let candidates = await db.workoutDetails
    .where("exerciseId")
    .equals(details[0].exerciseId)
    .and((detail) => detail.isDone === true)
    .toArray();
  if (isWorkout) {
    const currentWorkoutId = details[0].workoutId;
    candidates = candidates.filter((d) => d.workoutId !== currentWorkoutId);
  }
  return candidates;
};

const pickMostRecentDetailBeforeDate = async (
  candidates: LocalWorkoutDetail[],
  referenceDate?: Date
): Promise<LocalWorkoutDetail | undefined> => {
  if (!candidates.length) return undefined;

  const workoutIdToDateMap = new Map<number, string>();
  for (const detail of candidates) {
    if (!workoutIdToDateMap.has(detail.workoutId)) {
      const w = await db.workouts.get(detail.workoutId);
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
  const isWorkout = isWorkoutDetails(details);
  const candidates = await getAllDoneDetailsExceptCurrent(details);
  if (!candidates.length) return;
  let referenceDate: Date | undefined = undefined;
  if (isWorkout) {
    const currentWorkout = await db.workouts.get(details[0].workoutId);
    if (!currentWorkout?.date) return;
    referenceDate = new Date(currentWorkout.date);
  }
  const mostRecent = await pickMostRecentDetailBeforeDate(
    candidates,
    referenceDate
  );
  return mostRecent;
};

export const getWorkoutGroupByWorkoutDetail = async (
  detail: LocalWorkoutDetail
): Promise<LocalWorkoutDetail[]> => {
  return db.workoutDetails
    .where("workoutId")
    .equals(detail.workoutId)
    .and((d) => d.exerciseOrder === detail.exerciseOrder)
    .toArray();
};

export const updateWorkoutDetails = async (
  updatedDetails: LocalWorkoutDetail[]
) => {
  console.log(updatedDetails);
  await db.workoutDetails.bulkPut(updatedDetails);
};
