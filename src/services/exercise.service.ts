import { CATEGORY_OPTIONS } from "./../constants/filters";
import { exerciseAdapter } from "@/adapter/exercise.adapter";
import {
  fetchExercisesFromServer,
  postExercisesToServer,
} from "@/api/exercise.api";
import { db } from "@/lib/db";
import { ClientExercise, LocalExercise } from "@/types/models";

export const exerciseService = {
  async getExerciseWithServerId(
    serverId: number
  ): Promise<LocalExercise | void> {
    try {
      return await db.exercises.where("serverId").equals(serverId).first();
    } catch (e) {
      throw new Error("exercise 를 불러오는 데 실패했습니다");
    }
  },

  async getExerciseWithLocalId(id: number): Promise<LocalExercise | void> {
    try {
      return await db.exercises.where("id").equals(id).first();
    } catch (e) {
      throw new Error("exercise 를 불러오는 데 실패했습니다");
    }
  },

  async overwriteWithServerExercises(userId: string) {
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
  },

  async syncExercisesFromServerLocalFirst(userId: string) {
    const serverData: ClientExercise[] = await fetchExercisesFromServer(userId);
    const localAll = await db.exercises.toArray();

    const merged = exerciseAdapter.mergeServerExerciseData(
      serverData,
      localAll
    );

    await db.exercises.clear();
    await db.exercises.bulkPut(merged);
  },

  async getAllLocalExercises(): Promise<LocalExercise[]> {
    try {
      return db.exercises.toArray();
    } catch (e) {
      throw new Error("로컬 운동 목록을 불러오는 데 실패했습니다");
    }
  },

  async toggleLocalBookmark(
    localId: number,
    nextValue: boolean
  ): Promise<void> {
    try {
      await db.exercises.update(localId, {
        isBookmarked: nextValue,
        isSynced: false,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      throw new Error("북마크 토글에 실패했습니다");
    }
  },

  async getUnsyncedExercises(): Promise<LocalExercise[]> {
    try {
      return db.exercises.filter((ex) => !ex.isSynced).toArray();
    } catch (e) {
      throw new Error("UnsyncedExercises를 불러올 수 없습니다");
    }
  },

  // export const getExerciseName = async (exerciseId: number): Promise<string> => {
  //   const exercise = await db.exercises.get(exerciseId);
  //   if (!exercise) throw new Error("id와 일치하는 exercise를 찾을 수 없습니다");
  //   return exercise.name;
  // }; 쓸거면 테스트 작성해라

  async syncToServerExercises(userId: string): Promise<void> {
    const unsynced = await this.getUnsyncedExercises();
    const data = await postExercisesToServer(unsynced, userId);

    for (const updated of data.updated) {
      await db.exercises.update(updated.localId, {
        isSynced: true,
        serverId: updated.serverId,
      });
    }
  },

  async updateLocalExercise(
    updateInput: Partial<LocalExercise>
  ): Promise<number> {
    if (!updateInput.id) throw new Error("id가 없습니다");
    try {
      return db.exercises.update(updateInput.id, {
        ...updateInput,
        isSynced: false,
      });
    } catch (e) {
      throw new Error("운동 업데이트에 실패했습니다");
    }
  },

  async addLocalExercise({
    name,
    category,
    userId,
  }: {
    name: string;
    category: string;
    userId: string;
  }) {
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
    try {
      await db.exercises.add(newExercise);
    } catch (e) {
      throw new Error("운동 추가에 실패했습니다");
    }
  },
};
