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
    return this.repository.findAllByUserId(userId);
  }

  async getRoutineByServerId(serverId: string): Promise<LocalRoutine | void> {
    return this.repository.findOneByServerId(serverId);
  }

  async getRoutineByLocalId(localId: number): Promise<LocalRoutine | void> {
    return this.repository.findOneById(localId);
  }

  async addLocalRoutine(
    addLocalRoutineInput: AddLocalRoutineInput
  ): Promise<number> {
    const localId = await this.repository.add({
      ...addLocalRoutineInput,
      createdAt: new Date().toISOString(),
      isSynced: false,
      serverId: null,
      description: addLocalRoutineInput.description || "",
    });
    return localId;
  }

  async updateLocalRoutine(routine: Partial<LocalRoutine>): Promise<void> {
    if (!routine.id) throw new Error("routine id는 꼭 전달해주세요");
    await this.repository.update(routine.id, {
      ...routine,
      updatedAt: new Date().toISOString(),
      isSynced: false,
    });
  }

  async deleteLocalRoutine(routineId: number) {
    await this.repository.delete(routineId);
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
