import { workoutApi } from "@/api/workout.api";
import { ClientWorkout, LocalWorkout } from "@/types/models";
import { IWorkoutRepository } from "@/types/repositories";
import { IWorkoutService } from "@/types/services";
import { getFormattedDateYMD } from "@/util/formatDate";

export class WorkoutService implements IWorkoutService {
  constructor(
    private readonly repository: IWorkoutRepository, //
    private readonly api: typeof workoutApi // private readonly
  ) {}

  // ---- Core ---- //
  async getAllWorkouts(userId: string): Promise<LocalWorkout[]> {
    try {
      const workouts = await this.repository.findAllByUserIdOrderByDate(userId);

      return workouts;
    } catch (e) {
      throw new Error("workout 목록을 불러오는 데 실패했습니다");
    }
  }

  async getWorkoutWithServerId(serverId: string): Promise<LocalWorkout | void> {
    try {
      const workout = await this.repository.findOneByServerId(serverId);
      return workout;
    } catch (e) {
      throw new Error("workout을 불러오는 데 실패했습니다");
    }
  }
  async getWorkoutWithLocalId(id: number): Promise<LocalWorkout | void> {
    try {
      const workout = await this.repository.findOneById(id);
      return workout;
    } catch (e) {
      throw new Error("workout을 불러오는 데 실패했습니다");
    }
  }
  async getWorkoutByUserIdAndDate(
    userId: string,
    date: string
  ): Promise<LocalWorkout | void> {
    try {
      const workout = await this.repository.findOneByUserIdAndDate(
        userId,
        date
      );

      return workout;
    } catch (e) {
      throw new Error("workout을 불러오는 데 실패했습니다");
    }
  }
  async addLocalWorkout(userId: string, date: string): Promise<LocalWorkout> {
    try {
      const existing = await this.getWorkoutByUserIdAndDate(userId, date);
      if (existing) {
        return existing;
      }

      const localId = await this.repository.add({
        userId,
        date,
        createdAt: new Date().toISOString(),
        isSynced: false,
        status: "EMPTY",
        serverId: null,
      });

      const workout = await this.getWorkoutWithLocalId(localId);
      if (!workout) throw new Error("Workout을 불러오지 못했습니다");

      return workout;
    } catch (e) {
      throw new Error("Workout 추가에 실패했습니다");
    }
  }

  async updateLocalWorkout(workout: Partial<LocalWorkout>): Promise<void> {
    if (!workout.id) throw new Error("workout id는 필수입니다");
    try {
      await this.repository.update(workout.id, {
        ...workout,
        updatedAt: new Date().toISOString(),
        isSynced: false,
      });
    } catch (e) {
      throw new Error("Workout 업데이트에 실패했습니다");
    }
  }

  async deleteLocalWorkout(workoutId: number) {
    try {
      await this.repository.delete(workoutId);
    } catch (e) {
      throw new Error("Workout 삭제에 실패했습니다");
    }
  }

  // ---- Sync ---- //
  async syncToServerWorkouts(): Promise<void> {
    const all = await this.repository.findAll();

    const unsynced = all.filter((workout) => !workout.isSynced);
    const data = await this.api.postWorkoutsToServer(unsynced);

    if (data.updated) {
      for (const updated of data.updated) {
        await this.repository.update(updated.localId, {
          serverId: updated.serverId,
          isSynced: true,
        });
      }
    }
  }

  async overwriteWithServerWorkouts(userId: string): Promise<void> {
    const serverData: ClientWorkout[] =
      await this.api.fetchWorkoutsFromServer(userId);
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
    await this.repository.clear();

    await this.repository.bulkAdd(toInsert);
  }

  // ---- Query ---- //
  async getThisMonthWorkouts(
    startDate: string,
    endDate: string
  ): Promise<LocalWorkout[]> {
    try {
      const workouts = await this.repository.findAllByDateRangeExcludeEmpty(
        startDate,
        endDate
      );
      return workouts;
    } catch (e) {
      throw new Error("이번 달 workout 목록을 불러오는 데 실패했습니다");
    }
  }
}
