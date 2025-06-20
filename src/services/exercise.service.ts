import { ExerciseAdapter } from "@/adapter/exercise.adapter";
import {
  fetchExercisesFromServer,
  postExercisesToServer,
} from "@/api/exercise.api";
import { exerciseRepository } from "@/repositories/exercise.repository";

import { ClientExercise, LocalExercise } from "@/types/models";

const coreService = {
  async getExerciseWithServerId(
    serverId: number
  ): Promise<LocalExercise | void> {
    try {
      return await exerciseRepository.findOneByServerId(serverId);
    } catch (e) {
      throw new Error("exercise 를 불러오는 데 실패했습니다");
    }
  },

  async getAllLocalExercises(): Promise<LocalExercise[]> {
    try {
      return exerciseRepository.findAll();
    } catch (e) {
      throw new Error("로컬 운동 목록을 불러오는 데 실패했습니다");
    }
  },

  async getExerciseWithLocalId(id: number): Promise<LocalExercise | void> {
    try {
      return await exerciseRepository.findOneById(id);
    } catch (e) {
      throw new Error("exercise 를 불러오는 데 실패했습니다");
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
      await exerciseRepository.add(newExercise);
    } catch (e) {
      throw new Error("운동 추가에 실패했습니다");
    }
  },

  async updateLocalExercise(
    updateInput: Partial<LocalExercise>
  ): Promise<number> {
    if (!updateInput.id) throw new Error("id가 없습니다");
    try {
      return exerciseRepository.update(updateInput.id, {
        ...updateInput,
        isSynced: false,
      });
    } catch (e) {
      throw new Error("운동 업데이트에 실패했습니다");
    }
  },

  async toggleLocalBookmark(
    localId: number,
    nextValue: boolean
  ): Promise<void> {
    try {
      await exerciseRepository.update(localId, {
        isBookmarked: nextValue,
        isSynced: false,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      throw new Error("북마크 토글에 실패했습니다");
    }
  },
};
const syncService = {
  async _getUnsyncedExercises(): Promise<LocalExercise[]> {
    try {
      return exerciseRepository.findAllUnsynced();
    } catch (e) {
      throw new Error("UnsyncedExercises를 불러올 수 없습니다");
    }
  },

  async overwriteWithServerExercises(userId: string) {
    const serverData: ClientExercise[] = await fetchExercisesFromServer(userId);
    if (!serverData) {
      throw new Error("데이터 받아오기를 실패했습니다");
    }
    await exerciseRepository.clear();
    const toInsert = serverData.map((ex) => ({
      ...ex,
      serverId: ex.id,
      isSynced: true,
    }));
    await exerciseRepository.bulkAdd(toInsert);
  },

  async syncExercisesFromServerLocalFirst(userId: string) {
    const serverData: ClientExercise[] = await fetchExercisesFromServer(userId);
    const localAll = await exerciseRepository.findAll();

    const merged = ExerciseAdapter.mergeServerExerciseData(
      serverData,
      localAll
    );

    await exerciseRepository.clear();
    await exerciseRepository.bulkPut(merged);
  },
  async syncToServerExercises(userId: string): Promise<void> {
    const unsynced = await this._getUnsyncedExercises();
    const data = await postExercisesToServer(unsynced, userId);

    for (const updated of data.updated) {
      await exerciseRepository.update(updated.localId, {
        isSynced: true,
        serverId: updated.serverId,
      });
    }
  },
};
const queryService = {};

export const exerciseService = {
  ...coreService,
  ...syncService,
  ...queryService,
};
