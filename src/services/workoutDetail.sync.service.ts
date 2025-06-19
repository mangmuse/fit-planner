import { workoutDetailAdapter } from "@/adapter/workoutDetail.adapter";
import { workoutDetailRepository } from "@/repositories/workoutDetail.repository";
import { IWorkoutDetaeilApi } from "@/types/apis";
import { ClientWorkoutDetail } from "@/types/models";
import {
  IExerciseService,
  IWorkoutDetailSyncService,
  IWorkoutService,
} from "@/types/services";

export class WorkoutDetailSyncService implements IWorkoutDetailSyncService {
  constructor(
    private readonly repository: typeof workoutDetailRepository,
    private readonly adapter: typeof workoutDetailAdapter,
    private readonly api: IWorkoutDetaeilApi,
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
        return {
          ...data,
          id: undefined,
          serverId: data.id,
          isSynced: true,
          exerciseId: exercise.id,
          workoutId: workout.id,
        };
      })
    );
    await this.repository.clear();
    await this.repository.bulkAdd(toInsert);
  }
  public async syncToServerWorkoutDetails(): Promise<void> {
    const all = await this.repository.findAll();

    const unsynced = all.filter((detail) => !detail.isSynced);
    const mappedUnsynced =
      await this.adapter.convertLocalWorkoutDetailToServer(unsynced);
    const data = await this.api.postWorkoutDetailsToServer(mappedUnsynced);

    if (data.updated.length === 0) return;

    if (data.updated) {
      for (const updated of data.updated) {
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
  }
}
