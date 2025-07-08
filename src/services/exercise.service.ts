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
  public syncPromise: Promise<void> | null = null;

  public async getExerciseWithServerId(
    serverId: number
  ): Promise<Saved<LocalExercise> | void> {
    return await this.repository.findOneByServerId(serverId);
  }

  public async getAllLocalExercises(
    userId: string
  ): Promise<Saved<LocalExercise>[]> {
    return this.repository.findAll(userId);
  }

  public async getExerciseWithLocalId(
    id: number
  ): Promise<Saved<LocalExercise> | void> {
    return await this.repository.findOneById(id);
  }

  public async addLocalExercise({
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

  public async updateLocalExercise(
    updateInput: Partial<LocalExercise>
  ): Promise<number> {
    if (!updateInput.id) throw new Error("id가 없습니다");
    return this.repository.update(updateInput.id, {
      ...updateInput,
      isSynced: false,
    });
  }

  public async toggleLocalBookmark(
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

  public async overwriteWithServerExercises(userId: string) {
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

  public async syncExercisesFromServerLocalFirst(userId: string) {
    const serverData: ClientExercise[] =
      await this.api.fetchExercisesFromServer(userId);

    if (serverData.length === 0) return;

    const localAll = await this.repository.findAll(userId);

    const merged = this.adapter.mergeServerExerciseData(serverData, localAll);

    await this.repository.clear();
    await this.repository.bulkPut(merged);
  }

  public syncFromServerIfNeeded(userId: string): Promise<void> {
    if (this.syncPromise) {
      return this.syncPromise;
    }

    this.syncPromise = this.getAllLocalExercises(userId)
      .then((localExercises) => {
        if (localExercises.length === 0) {
          return this.syncExercisesFromServerLocalFirst(userId);
        }
      })
      .finally(() => {
        this.syncPromise = null;
      });

    return this.syncPromise;
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
