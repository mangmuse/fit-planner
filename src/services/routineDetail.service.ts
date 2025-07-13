import { SyncRoutineDetailsToServerResponse } from "@/api/routineDetail.api";
import { IRoutineDetailAdapter } from "@/types/adapters";
import { IRoutineDetailApi } from "@/types/apis";

import {
  ClientRoutineDetail,
  LocalRoutineDetail,
  LocalRoutineDetailWithServerRoutineId,
  Saved,
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
  ): Promise<Saved<LocalRoutineDetail>[]> {
    const details = await this.repository.findAllByRoutineId(routineId);

    return details;
  }

  public async addLocalRoutineDetail(
    routineDetailInput: LocalRoutineDetail
  ): Promise<void> {
    await this.repository.add(routineDetailInput);
    await this.routineService.updateLocalRoutineUpdatedAt(
      routineDetailInput.routineId
    );
  }

  public async getAllLocalRoutineDetailsByRoutineIds(
    routineIds: number[]
  ): Promise<Saved<LocalRoutineDetail>[]> {
    return this.repository.findAllByRoutineIds(routineIds);
  }

  public async addSetToRoutine(
    lastSet: Saved<LocalRoutineDetail>,
    weightUnit: "kg" | "lbs" = "kg"
  ): Promise<Saved<LocalRoutineDetail>> {
    const addSetInput = this.adapter.getAddSetToRoutineByLastSet(
      lastSet,
      weightUnit
    );
    const newSet = await this.repository.add(addSetInput);

    await this.routineService.updateLocalRoutineUpdatedAt(
      addSetInput.routineId
    );
    return { ...addSetInput, id: newSet };
  }

  public async addLocalRoutineDetailsByWorkoutId(
    routineId: number,
    startOrder: number,
    selectedExercises: { id: number; name: string }[],
    weightUnit: "kg" | "lbs" = "kg"
  ): Promise<void> {
    const newDetails = this.adapter.getNewRoutineDetails(
      selectedExercises,
      {
        routineId,
        startOrder,
      },
      weightUnit
    );
    await this.repository.bulkAdd(newDetails);
    await this.routineService.updateLocalRoutineUpdatedAt(routineId);
  }

  public async addPastWorkoutDetailsToRoutine(
    mappedDetails: LocalRoutineDetail[]
  ): Promise<void> {
    if (mappedDetails.length === 0) return;
    await this.repository.bulkAdd(mappedDetails);
    await this.routineService.updateLocalRoutineUpdatedAt(
      mappedDetails[0].routineId
    );
  }

  public async cloneRoutineDetailWithNewRoutineId(
    originalDetail: Saved<LocalRoutineDetail>,
    newRoutineId: number
  ) {
    const newDetailInput = this.adapter.cloneToCreateInput(
      originalDetail,
      newRoutineId
    );
    await this.repository.add(newDetailInput);
    await this.routineService.updateLocalRoutineUpdatedAt(newRoutineId);
  }

  public async updateLocalRoutineDetail(
    updateWorkoutInput: Partial<LocalRoutineDetail>
  ): Promise<void> {
    if (!updateWorkoutInput.id || !updateWorkoutInput.routineId)
      throw new Error("id 또는 routineId가 없습니다");
    await this.repository.update(updateWorkoutInput.id, updateWorkoutInput);
    await this.routineService.updateLocalRoutineUpdatedAt(
      updateWorkoutInput.routineId
    );
  }

  public async deleteRoutineDetail(detailId: number): Promise<void> {
    await this.repository.delete(detailId);
  }

  public async deleteRoutineDetails(
    details: Saved<LocalRoutineDetail>[]
  ): Promise<void> {
    const ids = details.map((detail) => detail.id);
    await this.repository.bulkDelete(ids);
    await this.routineService.updateLocalRoutineUpdatedAt(details[0].routineId);
  }

  public async deleteDetailsByRoutineId(routineId: number): Promise<void> {
    const details = await this.repository.findAllByRoutineId(routineId);
    const ids = details.map((detail) => detail.id);
    await this.repository.bulkDelete(ids);
    await this.routineService.deleteLocalRoutine(routineId);
  }

  public async reorderExerciseOrderAfterDelete(
    routineId: number,
    deletedExerciseOrder: number
  ): Promise<void> {
    const details = await this.repository.findAllByRoutineId(routineId);
    const updatedDetails = this.adapter.getReorderedDetailsAfterExerciseDelete(
      details,
      deletedExerciseOrder
    );

    if (updatedDetails.length > 0) {
      await this.repository.bulkPut(updatedDetails);
      await this.routineService.updateLocalRoutineUpdatedAt(routineId);
    }
  }

  public async reorderSetOrderAfterDelete(
    routineId: number,
    exerciseId: number,
    deletedSetOrder: number
  ): Promise<void> {
    const details = await this.repository.findAllByRoutineId(routineId);
    const updatedDetails = this.adapter.getReorderedDetailsAfterSetDelete(
      details,
      exerciseId,
      deletedSetOrder
    );

    if (updatedDetails.length > 0) {
      await this.repository.bulkPut(updatedDetails);
      await this.routineService.updateLocalRoutineUpdatedAt(routineId);
    }
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

        if (!exercise || !routine) {
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

  // async syncToServerRoutineDetails(): Promise<void> {
  //   const all = await this.repository.findAll();

  //   const unsynced = all.filter((detail) => !detail.isSynced);
  //   const mappedUnsynced = await this.mapDetailsToPayload(unsynced);
  //   const data = await this.api.postRoutineDetailsToServer(mappedUnsynced);

  //   if (data.updated.length === 0) return;

  //   if (data.updated) {
  //     await this.updateLocalRoutineDetailWithApiResponse(data.updated);
  //   }
  // }
}
