import {
  fetchRoutinesFromServer,
  postRoutinesToServer,
} from "@/api/routine.api";
import { db } from "@/lib/db";
import { routineRepository } from "@/repositories/routine.repository";
import { ClientRoutine, LocalRoutine } from "@/types/models";

type AddLocalRoutineInput = {
  userId: string;
  name: string;
  description?: string;
};

const coreService = {
  async getAllLocalRoutines(userId: string): Promise<LocalRoutine[]> {
    try {
      const routines = await routineRepository.findAllByUserId(userId);

      return routines;
    } catch (e) {
      throw new Error("루틴 목록을 불러오는 데 실패했습니다");
    }
  },

  async getRoutineByServerId(serverId: string): Promise<LocalRoutine | void> {
    try {
      const routine = await routineRepository.findOneByServerId(serverId);
      return routine;
    } catch (e) {
      throw new Error("routine을 불러오는 데 실패했습니다");
    }
  },

  async getRoutineByLocalId(localId: number): Promise<LocalRoutine | void> {
    try {
      const routine = await routineRepository.findOneById(localId);
      return routine;
    } catch (e) {
      throw new Error("routine을 불러오는 데 실패했습니다");
    }
  },

  async addLocalRoutine(
    addLocalRoutineInput: AddLocalRoutineInput
  ): Promise<number> {
    try {
      const localId = await routineRepository.add({
        ...addLocalRoutineInput,
        createdAt: new Date().toISOString(),
        isSynced: false,
        serverId: null,
        description: addLocalRoutineInput.description || "",
      });
      return localId;
    } catch (e) {
      throw new Error("루틴 추가에 실패했습니다");
    }
  },

  async updateLocalRoutine(routine: Partial<LocalRoutine>): Promise<void> {
    try {
      if (!routine.id) throw new Error("routine id는 꼭 전달해주세요");
      await routineRepository.update(routine.id, {
        ...routine,
        updatedAt: new Date().toISOString(),
        isSynced: false,
      });
    } catch (e) {
      throw new Error("루틴 업데이트에 실패했습니다");
    }
  },

  async deleteLocalRoutine(routineId: number) {
    try {
      await routineRepository.delete(routineId);
    } catch (e) {
      throw new Error("루틴 삭제에 실패했습니다");
    }
  },
};
const syncService = {
  async syncToServerRoutines(): Promise<void> {
    const all = await routineRepository.findAll();

    const unsynced = all.filter((routine) => !routine.isSynced);
    const data = await postRoutinesToServer(unsynced);

    if (data.updated) {
      for (const updated of data.updated) {
        await routineRepository.update(updated.localId, {
          serverId: updated.serverId,
          isSynced: true,
        });
      }
    }
  },

  async overwriteWithServerRoutines(userId: string): Promise<void> {
    const serverData: ClientRoutine[] = await fetchRoutinesFromServer(userId);
    if (!serverData) throw new Error("데이터 받아오기를 실패했습니다");
    if (serverData.length === 0) return;
    const toInsert = serverData.map((routine) => ({
      id: undefined,
      userId: routine.userId,
      serverId: routine.id,
      name: routine.name,
      description: routine.description || "",
      isSynced: true,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
    }));
    await routineRepository.clear();
    await routineRepository.bulkAdd(toInsert);
  },
};
const queryService = {};

export const routineService = {
  ...coreService,
  ...syncService,
  ...queryService,
};
