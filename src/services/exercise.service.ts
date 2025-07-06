import { IExerciseAdapter } from "@/types/adapters";
import { IExerciseApi } from "@/types/apis";
import { ClientExercise, LocalExercise, Saved } from "@/types/models";
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
  ): Promise<Saved<LocalExercise> | void> {
    return await this.repository.findOneByServerId(serverId);
  }

  async getAllLocalExercises(userId: string): Promise<Saved<LocalExercise>[]> {
    return this.repository.findAll(userId);
  }

  async getExerciseWithLocalId(
    id: number
  ): Promise<Saved<LocalExercise> | void> {
    return await this.repository.findOneById(id);
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
      id: undefined,
      userId,
      isSynced: false,
    };
    await this.repository.add(newExercise);
  }

  async updateLocalExercise(
    updateInput: Partial<LocalExercise>
  ): Promise<number> {
    if (!updateInput.id) throw new Error("id가 없습니다");
    return this.repository.update(updateInput.id, {
      ...updateInput,
      isSynced: false,
    });
  }

  async toggleLocalBookmark(
    localId: number,
    nextValue: boolean
  ): Promise<void> {
    await this.repository.update(localId, {
      isBookmarked: nextValue,
      isSynced: false,
      updatedAt: new Date().toISOString(),
    });
  }

  // ----- Sync ----- //

  private async getUnsyncedExercises(): Promise<Saved<LocalExercise>[]> {
    return this.repository.findAllUnsynced();
  }

  async overwriteWithServerExercises(userId: string) {
    const serverData: ClientExercise[] =
      await this.api.fetchExercisesFromServer(userId);

    if (serverData.length === 0) return;

    const toInsert = serverData.map((ex) => ({
      ...ex,
      serverId: ex.id,
      isSynced: true,
    }));
    await this.repository.clear();
    await this.repository.bulkAdd(toInsert);
  }

  async syncExercisesFromServerLocalFirst(userId: string) {
    const serverData: ClientExercise[] =
      await this.api.fetchExercisesFromServer(userId);

    if (serverData.length === 0) return;

    const localAll = await this.repository.findAll(userId);

    const merged = this.adapter.mergeServerExerciseData(serverData, localAll);

    await this.repository.clear();
    await this.repository.bulkPut(merged);
  }

  // async syncToServerExercises(userId: string): Promise<void> {
  //   const unsynced = await this.getUnsyncedExercises();
  //   const data = await this.api.postExercisesToServer(unsynced, userId);

  //   if (data.updated.length === 0) return;

  //   for (const updated of data.updated) {
  //     await this.repository.update(updated.localId, {
  //       isSynced: true,
  //       serverId: updated.serverId,
  //     });
  //   }
  // }
}
