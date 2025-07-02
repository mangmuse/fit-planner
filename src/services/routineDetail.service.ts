import { SyncRoutineDetailsToServerResponse } from "@/api/routineDetail.api";
import { IRoutineDetailAdapter } from "@/types/adapters";
import { IRoutineDetailApi } from "@/types/apis";

import {
  ClientRoutineDetail,
  LocalRoutineDetail,
  LocalRoutineDetailWithServerRoutineId,
} from "@/types/models";
import { IRoutineDetailRepository } from "@/types/repositories";
import {
  IExerciseService,
  IRoutineDetailService,
  IRoutineService,
} from "@/types/services";

export class RoutineDetailService implements IRoutineDetailService {
  constructor(
    private readonly exerciseService: IExerciseService, //
    private readonly routineService: IRoutineService,
    private readonly repository: IRoutineDetailRepository,
    private readonly adapter: IRoutineDetailAdapter,
    private readonly api: IRoutineDetailApi
  ) {}

  // ===== CORE =====
  public async getLocalRoutineDetails(
    routineId: number
  ): Promise<LocalRoutineDetail[]> {
    const details = await this.repository.findAllByRoutineId(routineId);
    return details;
  }

  public async addLocalRoutineDetail(
    routineDetailInput: LocalRoutineDetail
  ): Promise<void> {
    await this.repository.add(routineDetailInput);
  }

  public async addSetToRoutine(lastSet: LocalRoutineDetail): Promise<number> {
    const addSetInput = this.adapter.getAddSetToRoutineByLastSet(lastSet);
    const newSet = await this.repository.add(addSetInput);
    return newSet;
  }

  public async addLocalRoutineDetailsByWorkoutId(
    routineId: number,
    startOrder: number,
    selectedExercises: { id: number; name: string }[]
  ): Promise<void> {
    const newDetails = this.adapter.getNewRoutineDetails(selectedExercises, {
      routineId,
      startOrder,
    });
    await this.repository.bulkAdd(newDetails);
  }

  public async addPastWorkoutDetailsToRoutine(
    mappedDetails: LocalRoutineDetail[]
  ): Promise<void> {
    if (mappedDetails.length === 0) return;
    await this.repository.bulkAdd(mappedDetails);
  }

  public async cloneRoutineDetailWithNewRoutineId(
    originalDetail: LocalRoutineDetail,
    newRoutineId: number
  ) {
    const newDetailInput = this.adapter.cloneToCreateInput(
      originalDetail,
      newRoutineId
    );
    await this.repository.add(newDetailInput);
  }

  public async updateLocalRoutineDetail(
    updateWorkoutInput: Partial<LocalRoutineDetail>
  ): Promise<void> {
    if (!updateWorkoutInput.id) throw new Error("id가 없습니다");
    await this.repository.update(updateWorkoutInput.id, updateWorkoutInput);
  }

  public async deleteRoutineDetail(detailId: number): Promise<void> {
    await this.repository.delete(detailId);
  }

  public async deleteRoutineDetails(
    details: LocalRoutineDetail[]
  ): Promise<void> {
    const ids = details.map((detail) => {
      if (!detail.id) throw new Error("id가 없습니다");
      return detail.id;
    });
    await this.repository.bulkDelete(ids);
  }

  // ===== SYNC ===== //
  private async mapDetailsToPayload(
    details: LocalRoutineDetail[]
  ): Promise<LocalRoutineDetailWithServerRoutineId[]> {
    return Promise.all(
      details.map(async (detail) => {
        const exercise = await this.exerciseService.getExerciseWithLocalId(
          detail.exerciseId
        );
        const routine = await this.routineService.getRoutineByLocalId(
          detail.routineId
        );

        if (!exercise?.serverId || !routine?.serverId) {
          throw new Error("exercise 또는 routine의 serverId가 없습니다.");
        }

        return this.adapter.mapLocalRoutineDetailToServer(
          detail,
          exercise,
          routine
        );
      })
    );
  }

  private async updateLocalRoutineDetailWithApiResponse(
    updatedDetails: SyncRoutineDetailsToServerResponse["updated"]
  ): Promise<void> {
    for (const updated of updatedDetails) {
      const exercise = await this.exerciseService.getExerciseWithServerId(
        updated.exerciseId
      );
      const routine = await this.routineService.getRoutineByServerId(
        updated.routineId
      );
      await this.repository.update(updated.localId, {
        serverId: updated.serverId,
        isSynced: true,
        exerciseId: exercise?.id,
        routineId: routine?.id,
      });
    }
  }

  public async overwriteWithServerRoutineDetails(
    userId: string
  ): Promise<void> {
    const serverData: ClientRoutineDetail[] =
      await this.api.fetchRoutineDetailsFromServer(userId);

    const toInsert = await Promise.all(
      serverData.map(async (data) => {
        const exercise = await this.exerciseService.getExerciseWithServerId(
          data.exerciseId
        );
        const routine = await this.routineService.getRoutineByServerId(
          data.routineId
        );

        if (!exercise?.id || !routine?.id) {
          throw new Error(
            "exerciseId 또는 routineId가 일치하는 데이터를 찾을 수 없습니다"
          );
        }

        return {
          ...data,
          id: undefined,
          serverId: data.id,
          isSynced: true,
          exerciseId: exercise.id,
          routineId: routine.id,
        };
      })
    );
    await this.repository.clear();
    await this.repository.bulkAdd(toInsert);
  }

  async syncToServerRoutineDetails(): Promise<void> {
    const all = await this.repository.findAll();

    const unsynced = all.filter((detail) => !detail.isSynced);
    const mappedUnsynced = await this.mapDetailsToPayload(unsynced);
    const data = await this.api.postRoutineDetailsToServer(mappedUnsynced);

    if (data.updated.length === 0) return;

    if (data.updated) {
      await this.updateLocalRoutineDetailWithApiResponse(data.updated);
    }
  }
}
