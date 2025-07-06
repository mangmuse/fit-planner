import { BaseRepository } from "@/repositories/base.repository";
import { LocalWorkout, Saved } from "@/types/models";
import { IWorkoutRepository } from "@/types/repositories";
import { Table } from "dexie";

export class WorkoutRepository
  extends BaseRepository<LocalWorkout, number>
  implements IWorkoutRepository
{
  constructor(table: Table<LocalWorkout, number>) {
    super(table);
  }

  async findAll(userId: string): Promise<Saved<LocalWorkout>[]> {
    return this.table.where("userId").equals(userId).toArray() as Promise<
      Saved<LocalWorkout>[]
    >;
  }

  async findOneByServerId(
    serverId: string
  ): Promise<Saved<LocalWorkout> | undefined> {
    return this.table.where("serverId").equals(serverId).first() as Promise<
      Saved<LocalWorkout> | undefined
    >;
  }

  async findOneByUserIdAndDate(
    userId: string,
    date: string
  ): Promise<Saved<LocalWorkout> | undefined> {
    return this.table.where(["userId", "date"]).equals([userId, date]).first() as Promise<
      Saved<LocalWorkout> | undefined
    >;
  }

  async findAllByUserIdOrderByDate(
    userId: string
  ): Promise<Saved<LocalWorkout>[]> {
    return (await this.table
      .where("userId")
      .equals(userId)
      .sortBy("date")
      .then((workouts) => workouts.reverse())) as Saved<LocalWorkout>[];
  }

  async findAllByDateRangeExcludeEmpty(
    startDate: string,
    endDate: string
  ): Promise<Saved<LocalWorkout>[]> {
    return this.table
      .where("date")
      .between(startDate, endDate, true, true)
      .filter((workout) => workout.status !== "EMPTY")
      .toArray() as Promise<Saved<LocalWorkout>[]>;
  }
}
