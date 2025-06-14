import { CATEGORY_OPTIONS } from "./../constants/filters";
import { mergeServerExerciseData } from "@/adapter/exercise.adapter";
import {
  fetchExercisesFromServer,
  postExercisesToServer,
} from "@/api/exercise.api";
import { db } from "@/lib/db";
import { ClientExercise, LocalExercise } from "@/types/models";

export const getExerciseWithServerId = async (
  serverId: number
): Promise<LocalExercise> => {
  const exercise = await db.exercises
    .where("serverId")
    .equals(serverId)
    .first();
  if (!exercise) throw new Error("일치하는 exercise가 없습니다");
  return exercise;
};

export const getExerciseWithLocalId = async (
  id: number
): Promise<LocalExercise> => {
  const exercise = await db.exercises.where("id").equals(id).first();
  if (!exercise) throw new Error("일치하는 exercise가 없습니다");
  return exercise;
};
export async function overwriteWithServerExercises(userId: string) {
  const serverData: ClientExercise[] = await fetchExercisesFromServer(userId);
  if (!serverData) {
    throw new Error("데이터 받아오기를 실패했습니다");
  }
  await db.exercises.clear();
  const toInsert = serverData.map((ex) => ({
    ...ex,
    serverId: ex.id,
    isSynced: true,
  }));
  await db.exercises.bulkAdd(toInsert);
}

export async function syncExercisesFromServerLocalFirst(userId: string) {
  const serverData: ClientExercise[] = await fetchExercisesFromServer(userId);
  const localAll = await db.exercises.toArray();

  const merged = mergeServerExerciseData(serverData, localAll);

  await db.exercises.clear();
  await db.exercises.bulkPut(merged);
}

export async function getAllLocalExercises(): Promise<LocalExercise[]> {
  return db.exercises.toArray();
}

export const toggleLocalBookmark = async (
  localId: number,
  nextValue: boolean
): Promise<void> => {
  await db.exercises.update(localId, {
    isBookmarked: nextValue,
    isSynced: false,
    updatedAt: new Date().toISOString(),
  });
};

export const getUnsyncedExercises = async (): Promise<LocalExercise[]> => {
  return db.exercises.filter((ex) => !ex.isSynced).toArray();
};

// export const getExerciseName = async (exerciseId: number): Promise<string> => {
//   const exercise = await db.exercises.get(exerciseId);
//   if (!exercise) throw new Error("id와 일치하는 exercise를 찾을 수 없습니다");
//   return exercise.name;
// }; 쓸거면 테스트 작성해라

export async function syncToServerExercises(userId: string): Promise<void> {
  const unsynced = await getUnsyncedExercises();
  console.log(unsynced);
  const data = await postExercisesToServer(unsynced, userId);

  for (const updated of data.updated) {
    await db.exercises.update(updated.localId, {
      isSynced: true,
      serverId: updated.serverId,
    });
  }
}

export const updateLocalExercise = async (
  updateInput: Partial<LocalExercise>
): Promise<number> => {
  if (!updateInput.id) throw new Error("id가 없습니다");
  return db.exercises.update(updateInput.id, {
    ...updateInput,
    isSynced: false,
  });
};

export const addLocalExercise = async ({
  name,
  category,
  userId,
}: {
  name: string;
  category: string;
  userId: string;
}) => {
  if (!userId) throw new Error("userId가 없습니다");
  const newExercise: LocalExercise = {
    imageUrl: "",
    createdAt: new Date().toISOString(),
    isCustom: true,
    isBookmarked: false,
    name,
    category,
    serverId: null,
    unit: "kg",
    exerciseMemo: null,
    id: undefined, // id는 자동 생성됨
    userId,
    isSynced: false,
  };
  await db.exercises.add(newExercise);
};
