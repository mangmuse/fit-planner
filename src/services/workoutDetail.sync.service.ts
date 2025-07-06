import { SyncWorkoutDetailsToServerResponse } from "@/api/workoutDetail.api";
import { IWorkoutDetailAdapter } from "@/types/adapters";
import { IWorkoutDetailApi } from "@/types/apis";
import {
  ClientWorkoutDetail,
  LocalWorkoutDetail,
  LocalWorkoutDetailWithServerWorkoutId,
} from "@/types/models";
import { IWorkoutDetailRepository } from "@/types/repositories";
import {
  IExerciseService,
  IWorkoutDetailSyncService,
  IWorkoutService,
} from "@/types/services";

export class WorkoutDetailSyncService implements IWorkoutDetailSyncService {
  constructor(
    private readonly repository: IWorkoutDetailRepository,
    private readonly adapter: IWorkoutDetailAdapter,
    private readonly api: IWorkoutDetailApi,
    private readonly exerciseService: IExerciseService,
    private readonly workoutService: IWorkoutService
  ) {}

  public async overwriteWithServerWorkoutDetails(
    userId: string
  ): Promise<void> {
    const serverData: ClientWorkoutDetail[] =
      await this.api.fetchWorkoutDetailsFromServer(userId);

    const toInsert = await Promise.all(
      serverData.map(async (data) => {
        const exercise = await this.exerciseService.getExerciseWithServerId(
          data.exerciseId
        );

        const workout = await this.workoutService.getWorkoutWithServerId(
          data.workoutId
        );

        if (!exercise?.id || !workout?.id)
          throw new Error("exerciseId 또는 workoutId가 없습니다");
        return this.adapter.createOverwriteWorkoutDetailPayload(
          data,
          exercise,
          workout
        );
      })
    );
    await this.repository.clear();
    await this.repository.bulkAdd(toInsert);
  }

  private async mapDetailsToPayload(
    details: LocalWorkoutDetail[]
  ): Promise<LocalWorkoutDetailWithServerWorkoutId[]> {
    return Promise.all(
      details.map(async (detail) => {
        const exercise = await this.exerciseService.getExerciseWithLocalId(
          detail.exerciseId
        );
        const workout = await this.workoutService.getWorkoutWithLocalId(
          detail.workoutId
        );

        if (!exercise?.serverId || !workout?.serverId) {
          throw new Error("exercise 또는 workout의 serverId가 없습니다.");
        }
        return this.adapter.mapLocalWorkoutDetailToServer(
          detail,
          exercise,
          workout
        );
      })
    );
  }

  private async updateLocalWorkoutDetailWithApiResponse(
    updatedDetails: SyncWorkoutDetailsToServerResponse["updated"]
  ): Promise<void> {
    for (const updated of updatedDetails) {
      const exercise = await this.exerciseService.getExerciseWithServerId(
        updated.exerciseId
      );
      const workout = await this.workoutService.getWorkoutWithServerId(
        updated.workoutId
      );
      await this.repository.update(updated.localId, {
        serverId: updated.serverId,
        isSynced: true,
        exerciseId: exercise?.id,
        workoutId: workout?.id,
      });
    }
  }

  // public async syncToServerWorkoutDetails(): Promise<void> {
  //   const all = await this.repository.findAll();

  //   const unsynced = all.filter((detail) => !detail.isSynced);
  //   const mappedUnsynced = await this.mapDetailsToPayload(unsynced);
  //   const data = await this.api.postWorkoutDetailsToServer(mappedUnsynced);

  //   if (data.updated.length === 0) return;

  //   if (data.updated) {
  //     await this.updateLocalWorkoutDetailWithApiResponse(data.updated);
  //   }
  // }
}
