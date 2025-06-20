import { IRoutineDetailAdapter } from "@/types/adapters";
import { IRoutineDetailApi } from "@/types/apis";

import { ClientRoutineDetail, LocalRoutineDetail } from "@/types/models";
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
  async getLocalRoutineDetails(
    routineId: number
  ): Promise<LocalRoutineDetail[]> {
    try {
      const details = await this.repository.findAllByRoutineId(routineId);
      return details;
    } catch (e) {
      throw new Error("RoutineDetails를 불러오는 데 실패했습니다");
    }
  }

  async addLocalRoutineDetail(
    routineDetailInput: LocalRoutineDetail
  ): Promise<void> {
    try {
      await this.repository.add(routineDetailInput);
    } catch (e) {
      throw new Error("RoutineDetails를 추가하는 데 실패했습니다");
    }
  }

  async addSetToRoutine(lastSet: LocalRoutineDetail): Promise<number> {
    try {
      const addSetInput = this.adapter.getAddSetToRoutineByLastSet(lastSet);
      const newSet = await this.repository.add(addSetInput);
      return newSet;
    } catch (e) {
      throw new Error("RoutineDetail을 추가하는 데 실패했습니다");
    }
  }

  async addLocalRoutineDetailsByWorkoutId(
    routineId: number,
    startOrder: number,
    selectedExercises: { id: number; name: string }[]
  ): Promise<number> {
    try {
      if (startOrder === null) {
        // startOrder = await getStartExerciseOrder(workoutId); // workoutId가 temp인경우 startOrder는 1
      }
      const newDetails = this.adapter.getNewRoutineDetails(selectedExercises, {
        routineId,
        startOrder,
      });
      const routineDetails = await this.repository.bulkAdd(newDetails);

      return routineDetails;
    } catch (e) {
      throw new Error("RoutineDetails를 추가하는 데 실패했습니다");
    }
  }
  async cloneRoutineDetailWithNewRoutineId(
    originalDetail: LocalRoutineDetail,
    newRoutineId: number
  ) {
    try {
      const {
        id,
        createdAt,
        updatedAt,
        serverId,
        isSynced,
        routineId,
        ...rest
      } = originalDetail;
      const newDetailInput: LocalRoutineDetail = {
        ...rest,
        routineId: newRoutineId,
        serverId: null,
        isSynced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await this.repository.add(newDetailInput);
    } catch (e) {
      throw new Error("RoutineDetail을 복제하는 데 실패했습니다");
    }
  }

  async updateLocalRoutineDetail(
    updateWorkoutInput: Partial<LocalRoutineDetail>
  ): Promise<void> {
    try {
      if (!updateWorkoutInput.id) throw new Error("id가 없습니다");
      await this.repository.update(updateWorkoutInput.id, updateWorkoutInput);
    } catch (e) {
      throw new Error("RoutineDetails를 업데이트하는 데 실패했습니다");
    }
  }

  async deleteRoutineDetail(detailId: number): Promise<void> {
    try {
      await this.repository.delete(detailId);
    } catch (e) {
      throw new Error("RoutineDetail을 삭제하는 데 실패했습니다");
    }
  }

  async deleteRoutineDetails(details: LocalRoutineDetail[]): Promise<void> {
    try {
      await Promise.all(
        details.map(async (detail) => {
          if (!detail.id) throw new Error("id가 없습니다");
          await this.repository.delete(detail.id);
        })
      );
    } catch (e) {
      throw new Error("RoutineDetails를 삭제하는 데 실패했습니다");
    }
  }

  // ===== SYNC ===== //
  async syncToServerRoutineDetails(): Promise<void> {
    // syncToServerRoutine 가 완료된 후에 호출되어야 함

    const all = await this.repository.findAll();

    const unsynced = all.filter((detail) => !detail.isSynced);
    const mappedUnsynced = await Promise.all(
      unsynced.map(async (detail) => {
        const exercise = await this.exerciseService.getExerciseWithLocalId(
          detail.exerciseId
        );
        const routine = await this.routineService.getRoutineByLocalId(
          detail.routineId
        );

        if (!exercise || !routine) {
          throw new Error("exercise 또는 routine을 찾을 수 없습니다.");
        }

        return this.adapter.mapLocalRoutineDetailToServer(
          detail,
          exercise,
          routine
        );
      })
    );

    const data = await this.api.postRoutineDetailsToServer(mappedUnsynced);

    if (data.updated) {
      for (const updated of data.updated) {
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
  }

  async overwriteWithServerRoutineDetails(userId: string): Promise<void> {
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
}
