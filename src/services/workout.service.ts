import { IWorkoutApi } from "@/types/apis";
import { ClientWorkout, LocalWorkout, Saved } from "@/types/models";
import { IWorkoutRepository } from "@/types/repositories";
import { IWorkoutService } from "@/types/services";
import { getFormattedDateYMD } from "@/util/formatDate";

export class WorkoutService implements IWorkoutService {
  constructor(
    private readonly repository: IWorkoutRepository, //
    private readonly api: IWorkoutApi
  ) {}

  // ---- Core ---- //
  public async getAllWorkouts(userId: string): Promise<Saved<LocalWorkout>[]> {
    return this.repository.findAllByUserIdOrderByDate(userId);
  }

  public async getWorkoutWithServerId(
    serverId: string
  ): Promise<Saved<LocalWorkout> | undefined> {
    return this.repository.findOneByServerId(serverId);
  }

  public async getWorkoutWithLocalId(id: number): Promise<Saved<LocalWorkout> | undefined> {
    return this.repository.findOneById(id);
  }

  public async getWorkoutByUserIdAndDate(
    userId: string,
    date: string
  ): Promise<Saved<LocalWorkout> | undefined> {
    return this.repository.findOneByUserIdAndDate(userId, date);
  }

  public async addLocalWorkout(
    userId: string,
    date: string
  ): Promise<Saved<LocalWorkout>> {
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
    // TODO: 에러 전파를 못하는 문제 해결
    if (!workout) throw new Error("Workout을 불러오지 못했습니다");

    return workout;
  }

  public async updateLocalWorkout(
    workout: Partial<LocalWorkout>
  ): Promise<void> {
    if (!workout.id) throw new Error("workout id는 필수입니다");
    await this.repository.update(workout.id, {
      ...workout,
      updatedAt: new Date().toISOString(),
      isSynced: false,
    });
  }

  public async deleteLocalWorkout(workoutId: number) {
    await this.repository.delete(workoutId);
  }

  // ---- Sync ---- //
  // public async syncToServerWorkouts(userId: string): Promise<void> {
  //   const all = await this.repository.findAll(userId);

  //   const unsynced = all.filter((workout) => !workout.isSynced);
  //   const data = await this.api.postWorkoutsToServer(unsynced);

  //   if (data.updated.length === 0) return;

  //   for (const updated of data.updated) {
  //     await this.repository.update(updated.localId, {
  //       serverId: updated.serverId,
  //       isSynced: true,
  //     });
  //   }
  // }

  public async overwriteWithServerWorkouts(userId: string): Promise<void> {
    const serverData: ClientWorkout[] =
      await this.api.fetchWorkoutsFromServer(userId);

    if (serverData.length === 0) return;

    const toInsert = serverData.map((workout) => ({
      id: undefined,
      userId: workout.userId,
      serverId: workout.id,
      date: getFormattedDateYMD(workout.date),
      isSynced: true,
      status: "EMPTY" as const,
      createdAt: workout.createdAt,
      updatedAt: null,
    }));
    await this.repository.clear();

    await this.repository.bulkAdd(toInsert);
  }

  // ---- Query ---- //
  public async getThisMonthWorkouts(
    startDate: string,
    endDate: string
  ): Promise<Saved<LocalWorkout>[]> {
    return this.repository.findAllByDateRangeExcludeEmpty(startDate, endDate);
  }
}
