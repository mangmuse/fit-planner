import { IExerciseAdapter } from "@/types/adapters";
import { IExerciseApi } from "@/types/apis";
import { ClientExercise, LocalExercise } from "@/types/models";
import { IExerciseRepository } from "@/types/repositories";
import { IExerciseService } from "@/types/services";

export class ExerciseService implements IExerciseService {
  constructor(
    private readonly repository: IExerciseRepository, //
    private readonly adapter: IExerciseAdapter,
    private readonly api: IExerciseApi
  ) {}

  async getExerciseWithServerId(
    serverId: number
  ): Promise<LocalExercise | void> {
    try {
      return await this.repository.findOneByServerId(serverId);
    } catch (e) {
      throw new Error("exercise 를 불러오는 데 실패했습니다");
    }
  }

  async getAllLocalExercises(): Promise<LocalExercise[]> {
    try {
      return this.repository.findAll();
    } catch (e) {
      throw new Error("로컬 운동 목록을 불러오는 데 실패했습니다");
    }
  }

  async getExerciseWithLocalId(id: number): Promise<LocalExercise | void> {
    try {
      return await this.repository.findOneById(id);
    } catch (e) {
      throw new Error("exercise 를 불러오는 데 실패했습니다");
    }
  }

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
      await this.repository.add(newExercise);
    } catch (e) {
      throw new Error("운동 추가에 실패했습니다");
    }
  }

  async updateLocalExercise(
    updateInput: Partial<LocalExercise>
  ): Promise<number> {
    if (!updateInput.id) throw new Error("id가 없습니다");
    try {
      return this.repository.update(updateInput.id, {
        ...updateInput,
        isSynced: false,
      });
    } catch (e) {
      throw new Error("운동 업데이트에 실패했습니다");
    }
  }

  async toggleLocalBookmark(
    localId: number,
    nextValue: boolean
  ): Promise<void> {
    try {
      await this.repository.update(localId, {
        isBookmarked: nextValue,
        isSynced: false,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      throw new Error("북마크 토글에 실패했습니다");
    }
  }

  // ----- Sync ----- //

  private async getUnsyncedExercises(): Promise<LocalExercise[]> {
    try {
      return this.repository.findAllUnsynced();
    } catch (e) {
      throw new Error("UnsyncedExercises를 불러올 수 없습니다");
    }
  }

  async overwriteWithServerExercises(userId: string) {
    const serverData: ClientExercise[] =
      await this.api.fetchExercisesFromServer(userId);
    if (!serverData) {
      throw new Error("데이터 받아오기를 실패했습니다");
    }
    await this.repository.clear();
    const toInsert = serverData.map((ex) => ({
      ...ex,
      serverId: ex.id,
      isSynced: true,
    }));
    await this.repository.bulkAdd(toInsert);
  }

  async syncExercisesFromServerLocalFirst(userId: string) {
    const serverData: ClientExercise[] =
      await this.api.fetchExercisesFromServer(userId);
    const localAll = await this.repository.findAll();

    const merged = this.adapter.mergeServerExerciseData(serverData, localAll);

    await this.repository.clear();
    await this.repository.bulkPut(merged);
  }
  async syncToServerExercises(userId: string): Promise<void> {
    const unsynced = await this.getUnsyncedExercises();
    const data = await this.api.postExercisesToServer(unsynced, userId);

    for (const updated of data.updated) {
      await this.repository.update(updated.localId, {
        isSynced: true,
        serverId: updated.serverId,
      });
    }
  }
}
