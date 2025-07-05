import { BaseRepository } from "@/repositories/base.repository";
import { LocalWorkout } from "@/types/models";
import { IWorkoutRepository } from "@/types/repositories";
import { Table } from "dexie";

export class WorkoutRepository
  extends BaseRepository<LocalWorkout, number>
  implements IWorkoutRepository
{
  constructor(table: Table<LocalWorkout, number>) {
    super(table);
  }

  async findAll(userId: string): Promise<LocalWorkout[]> {
    return this.table.where("userId").equals(userId).toArray();
  }

  async findOneByServerId(serverId: string): Promise<LocalWorkout | undefined> {
    return this.table.where("serverId").equals(serverId).first();
  }

  async findOneByUserIdAndDate(
    userId: string,
    date: string
  ): Promise<LocalWorkout | undefined> {
    return this.table.where(["userId", "date"]).equals([userId, date]).first();
  }

  async findAllByUserIdOrderByDate(userId: string): Promise<LocalWorkout[]> {
    return this.table
      .where("userId")
      .equals(userId)
      .sortBy("date")
      .then((workouts) => workouts.reverse());
  }

  async findAllByDateRangeExcludeEmpty(
    startDate: string,
    endDate: string
  ): Promise<LocalWorkout[]> {
    return this.table
      .where("date")
      .between(startDate, endDate, true, true)
      .filter((workout) => workout.status !== "EMPTY")
      .toArray();
  }
}
