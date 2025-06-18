import { routineDetailAdapter } from "@/adapter/routineDetail.adapter";
import {
  fetchRoutineDetailsFromServer,
  postRoutineDetailsToServer,
} from "@/api/routineDetail.api";
import { db } from "@/lib/db";
import { routineDetailRepository } from "@/repositories/routineDetail.repository";
import { exerciseService } from "@/services/exercise.service";
import { getRoutineByServerId } from "@/services/routine.service";
import { ClientRoutineDetail, LocalRoutineDetail } from "@/types/models";

export type NewRoutineDetailInput = {
  routineId: number;
  startOrder: number;
};

const coreService = {
  async getLocalRoutineDetails(
    routineId: number
  ): Promise<LocalRoutineDetail[]> {
    try {
      const details =
        await routineDetailRepository.findAllByRoutineId(routineId);
      return details;
    } catch (e) {
      throw new Error("RoutineDetails를 불러오는 데 실패했습니다");
    }
  },

  async addLocalRoutineDetail(
    routineDetailInput: LocalRoutineDetail
  ): Promise<void> {
    try {
      await routineDetailRepository.add(routineDetailInput);
    } catch (e) {
      throw new Error("RoutineDetails를 추가하는 데 실패했습니다");
    }
  },

  async addSetToRoutine(lastSet: LocalRoutineDetail): Promise<number> {
    try {
      const addSetInput =
        routineDetailAdapter.getAddSetToRoutineByLastSet(lastSet);
      const newSet = await routineDetailRepository.add(addSetInput);
      return newSet;
    } catch (e) {
      throw new Error("RoutineDetail을 추가하는 데 실패했습니다");
    }
  },

  async addLocalRoutineDetailsByWorkoutId(
    routineId: number,
    startOrder: number,
    selectedExercises: { id: number; name: string }[]
  ): Promise<number> {
    try {
      if (startOrder === null) {
        // startOrder = await getStartExerciseOrder(workoutId); // workoutId가 temp인경우 startOrder는 1
      }
      const newDetails = routineDetailAdapter.getNewRoutineDetails(
        selectedExercises,
        {
          routineId,
          startOrder,
        }
      );
      const routineDetails = await routineDetailRepository.bulkAdd(newDetails);

      return routineDetails;
    } catch (e) {
      throw new Error("RoutineDetails를 추가하는 데 실패했습니다");
    }
  },
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
      await routineDetailRepository.add(newDetailInput);
    } catch (e) {
      throw new Error("RoutineDetail을 복제하는 데 실패했습니다");
    }
  },

  async updateLocalRoutineDetail(
    updateWorkoutInput: Partial<LocalRoutineDetail>
  ): Promise<void> {
    try {
      if (!updateWorkoutInput.id) throw new Error("id가 없습니다");
      await routineDetailRepository.update(
        updateWorkoutInput.id,
        updateWorkoutInput
      );
    } catch (e) {
      throw new Error("RoutineDetails를 업데이트하는 데 실패했습니다");
    }
  },

  async deleteRoutineDetail(detailId: number): Promise<void> {
    try {
      await routineDetailRepository.delete(detailId);
    } catch (e) {
      throw new Error("RoutineDetail을 삭제하는 데 실패했습니다");
    }
  },

  async deleteRoutineDetails(details: LocalRoutineDetail[]): Promise<void> {
    try {
      await Promise.all(
        details.map(async (detail) => {
          if (!detail.id) throw new Error("id가 없습니다");
          await routineDetailRepository.delete(detail.id);
        })
      );
    } catch (e) {
      throw new Error("RoutineDetails를 삭제하는 데 실패했습니다");
    }
  },
};

const syncService = {
  async syncToServerRoutineDetails(): Promise<void> {
    // syncToServerRoutine 가 완료된 후에 호출되어야 함

    const all = await routineDetailRepository.findAll();

    const unsynced = all.filter((detail) => !detail.isSynced);
    const mappedUnsynced =
      await routineDetailAdapter.convertLocalRoutineDetailsToServer(unsynced);

    const data = await postRoutineDetailsToServer(mappedUnsynced);

    if (data.updated) {
      for (const updated of data.updated) {
        const exercise = await exerciseService.getExerciseWithServerId(
          updated.exerciseId
        );
        const routine = await getRoutineByServerId(updated.routineId);
        await routineDetailRepository.update(updated.localId, {
          serverId: updated.serverId,
          isSynced: true,
          exerciseId: exercise?.id,
          routineId: routine?.id,
        });
      }
    }
  },

  async overwriteWithServerRoutineDetails(userId: string): Promise<void> {
    const serverData: ClientRoutineDetail[] =
      await fetchRoutineDetailsFromServer(userId);

    const toInsert = await Promise.all(
      serverData.map(async (data) => {
        const exercise = await exerciseService.getExerciseWithServerId(
          data.exerciseId
        );
        const routine = await getRoutineByServerId(data.routineId);

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
    await routineDetailRepository.clear();
    await routineDetailRepository.bulkAdd(toInsert);
  },
};
const queryService = {};

export const routineDetailService = {
  ...coreService,
  ...syncService,
  ...queryService,
};
