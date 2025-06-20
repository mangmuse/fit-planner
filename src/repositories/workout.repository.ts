import { db } from "@/lib/db";
import { LocalWorkout } from "@/types/models";

export const workoutRepository = {
  async clear(): Promise<void> {
    await db.workouts.clear();
  },

  async findAll(): Promise<LocalWorkout[]> {
    return db.workouts.toArray();
  },

  async findOneById(workoutId: number): Promise<LocalWorkout | undefined> {
    return db.workouts.get(workoutId);
  },

  async findOneByServerId(serverId: string): Promise<LocalWorkout | undefined> {
    return db.workouts.where("serverId").equals(serverId).first();
  },

  async findOneByUserIdAndDate(
    userId: string,
    date: string
  ): Promise<LocalWorkout | undefined> {
    return db.workouts.where(["userId", "date"]).equals([userId, date]).first();
  },

  async findAllByUserIdOrderByDate(userId: string): Promise<LocalWorkout[]> {
    return db.workouts
      .where("userId")
      .equals(userId)
      .sortBy("date")
      .then((workouts) => workouts.reverse());
  },

  async findAllByDateRangeExcludeEmpty(
    startDate: string,
    endDate: string
  ): Promise<LocalWorkout[]> {
    return db.workouts
      .where("date")
      .between(startDate, endDate, true, true)
      .filter((workout) => workout.status !== "EMPTY")
      .toArray();
  },

  async add(toInsert: LocalWorkout): Promise<number> {
    return db.workouts.add(toInsert);
  },

  async bulkAdd(toInsert: LocalWorkout[]): Promise<number> {
    return db.workouts.bulkAdd(toInsert);
  },

  async update(id: number, toUpdate: Partial<LocalWorkout>): Promise<number> {
    return db.workouts.update(id, toUpdate);
  },

  async delete(id: number): Promise<void> {
    await db.workouts.delete(id);
  },
};
