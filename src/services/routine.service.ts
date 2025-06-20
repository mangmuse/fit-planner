import { IRoutineApi } from "@/types/apis";

import { ClientRoutine, LocalRoutine } from "@/types/models";
import { IRoutineRepository } from "@/types/repositories";
import { IRoutineService } from "@/types/services";

type AddLocalRoutineInput = {
  userId: string;
  name: string;
  description?: string;
};

export class RoutineService implements IRoutineService {
  constructor(
    private readonly repository: IRoutineRepository,
    private readonly api: IRoutineApi
  ) {}
  // ----- CORE ----- //
  async getAllLocalRoutines(userId: string): Promise<LocalRoutine[]> {
    try {
      const routines = await this.repository.findAllByUserId(userId);

      return routines;
    } catch (e) {
      throw new Error("루틴 목록을 불러오는 데 실패했습니다");
    }
  }

  async getRoutineByServerId(serverId: string): Promise<LocalRoutine | void> {
    try {
      const routine = await this.repository.findOneByServerId(serverId);
      return routine;
    } catch (e) {
      throw new Error("routine을 불러오는 데 실패했습니다");
    }
  }

  async getRoutineByLocalId(localId: number): Promise<LocalRoutine | void> {
    try {
      const routine = await this.repository.findOneById(localId);
      return routine;
    } catch (e) {
      throw new Error("routine을 불러오는 데 실패했습니다");
    }
  }

  async addLocalRoutine(
    addLocalRoutineInput: AddLocalRoutineInput
  ): Promise<number> {
    try {
      const localId = await this.repository.add({
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
  }

  async updateLocalRoutine(routine: Partial<LocalRoutine>): Promise<void> {
    try {
      if (!routine.id) throw new Error("routine id는 꼭 전달해주세요");
      await this.repository.update(routine.id, {
        ...routine,
        updatedAt: new Date().toISOString(),
        isSynced: false,
      });
    } catch (e) {
      throw new Error("루틴 업데이트에 실패했습니다");
    }
  }

  async deleteLocalRoutine(routineId: number) {
    try {
      await this.repository.delete(routineId);
    } catch (e) {
      throw new Error("루틴 삭제에 실패했습니다");
    }
  }

  // ===== SYNC ===== //
  async syncToServerRoutines(): Promise<void> {
    const all = await this.repository.findAll();

    const unsynced = all.filter((routine) => !routine.isSynced);
    const data = await this.api.postRoutinesToServer(unsynced);

    if (data.updated) {
      for (const updated of data.updated) {
        await this.repository.update(updated.localId, {
          serverId: updated.serverId,
          isSynced: true,
        });
      }
    }
  }

  async overwriteWithServerRoutines(userId: string): Promise<void> {
    const serverData: ClientRoutine[] =
      await this.api.fetchRoutinesFromServer(userId);
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
    await this.repository.clear();
    await this.repository.bulkAdd(toInsert);
  }
}
