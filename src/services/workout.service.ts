import {
  fetchWorkoutsFromServer,
  postWorkoutsToServer,
} from "@/api/workout.api";
import { db } from "@/lib/db";
import { workoutRepository } from "@/repositories/workout.repository";
import { ClientWorkout, LocalWorkout } from "@/types/models";
import { getFormattedDateYMD } from "@/util/formatDate";

const coreService = {
  async getAllWorkouts(userId: string): Promise<LocalWorkout[]> {
    try {
      const workouts =
        await workoutRepository.findAllByUserIdOrderByDate(userId);

      return workouts;
    } catch (e) {
      throw new Error("workout 목록을 불러오는 데 실패했습니다");
    }
  },

  async getWorkoutWithServerId(serverId: string): Promise<LocalWorkout | void> {
    try {
      const workout = await workoutRepository.findOneByServerId(serverId);
      return workout;
    } catch (e) {
      throw new Error("workout을 불러오는 데 실패했습니다");
    }
  },
  async getWorkoutWithLocalId(id: number): Promise<LocalWorkout | void> {
    try {
      const workout = await workoutRepository.findOneById(id);
      return workout;
    } catch (e) {
      throw new Error("workout을 불러오는 데 실패했습니다");
    }
  },
  async getWorkoutByUserIdAndDate(
    userId: string,
    date: string
  ): Promise<LocalWorkout | void> {
    try {
      const workout = await workoutRepository.findOneByUserIdAndDate(
        userId,
        date
      );

      return workout;
    } catch (e) {
      throw new Error("workout을 불러오는 데 실패했습니다");
    }
  },
  async addLocalWorkout(userId: string, date: string): Promise<LocalWorkout> {
    try {
      const existing = await coreService.getWorkoutByUserIdAndDate(
        userId,
        date
      );
      if (existing) {
        return existing;
      }

      const localId = await workoutRepository.add({
        userId,
        date,
        createdAt: new Date().toISOString(),
        isSynced: false,
        status: "EMPTY",
        serverId: null,
      });

      const workout = await coreService.getWorkoutWithLocalId(localId);
      if (!workout) throw new Error("Workout을 불러오지 못했습니다");

      return workout;
    } catch (e) {
      throw new Error("Workout 추가에 실패했습니다");
    }
  },

  async updateLocalWorkout(workout: Partial<LocalWorkout>): Promise<void> {
    if (!workout.id) throw new Error("workout id는 필수입니다");
    try {
      await workoutRepository.update(workout.id, {
        ...workout,
        updatedAt: new Date().toISOString(),
        isSynced: false,
      });
    } catch (e) {
      throw new Error("Workout 업데이트에 실패했습니다");
    }
  },

  async deleteLocalWorkout(workoutId: number) {
    try {
      await workoutRepository.delete(workoutId);
    } catch (e) {
      throw new Error("Workout 삭제에 실패했습니다");
    }
  },
};
const syncService = {
  async syncToServerWorkouts(): Promise<void> {
    const all = await workoutRepository.findAll();

    const unsynced = all.filter((workout) => !workout.isSynced);
    const data = await postWorkoutsToServer(unsynced);

    if (data.updated) {
      for (const updated of data.updated) {
        await workoutRepository.update(updated.localId, {
          serverId: updated.serverId,
          isSynced: true,
        });
      }
    }
  },

  async overwriteWithServerWorkouts(userId: string): Promise<void> {
    const serverData: ClientWorkout[] = await fetchWorkoutsFromServer(userId);
    if (!serverData) throw new Error("데이터 받아오기를 실패했습니다");
    if (serverData.length === 0) return;
    const toInsert = serverData.map((workout) => ({
      id: undefined,
      userId: workout.userId,
      serverId: workout.id,
      date: getFormattedDateYMD(workout.date),
      isSynced: true,
      status: "EMPTY" as const,
      createdAt: workout.createdAt,
      updatedAt: workout.updatedAt,
    }));
    await workoutRepository.clear();

    await workoutRepository.bulkAdd(toInsert);
  },
};
const queryService = {
  async getThisMonthWorkouts(
    startDate: string,
    endDate: string
  ): Promise<LocalWorkout[]> {
    try {
      const workouts = await workoutRepository.findAllByDateRangeExcludeEmpty(
        startDate,
        endDate
      );
      return workouts;
    } catch (e) {
      throw new Error("이번 달 workout 목록을 불러오는 데 실패했습니다");
    }
  },
};

export const workoutService = {
  ...coreService,
  ...syncService,
  ...queryService,
};
