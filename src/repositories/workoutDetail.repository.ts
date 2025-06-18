import { db } from "@/lib/db";
import { LocalWorkoutDetail } from "@/types/models";

export const workoutDetailRepository = {
  async clear(): Promise<void> {
    await db.workoutDetails.clear();
  },

  async findAll(): Promise<LocalWorkoutDetail[]> {
    return db.workoutDetails.toArray();
  },

  async findAllByWorkoutId(workoutId: number): Promise<LocalWorkoutDetail[]> {
    return db.workoutDetails.where("workoutId").equals(workoutId).toArray();
  },

  async findAllByWorkoutIdOrderByExerciseOrder(
    workoutId: number
  ): Promise<LocalWorkoutDetail[]> {
    return db.workoutDetails
      .where("workoutId")
      .equals(workoutId)
      .sortBy("exerciseOrder");
  },

  async findAllByWorkoutIdAndExerciseOrder(
    workoutId: number,
    exerciseOrder: number
  ): Promise<LocalWorkoutDetail[]> {
    return db.workoutDetails
      .where("workoutId")
      .equals(workoutId)
      .and((detail) => detail.exerciseOrder === exerciseOrder)
      .toArray();
  },

  async findAllDoneByExerciseId(
    exerciseId: number
  ): Promise<LocalWorkoutDetail[]> {
    return db.workoutDetails
      .where("exerciseId")
      .equals(exerciseId)
      .and((detail) => detail.isDone === true)
      .toArray();
  },

  async add(toInsert: LocalWorkoutDetail): Promise<number> {
    return db.workoutDetails.add(toInsert);
  },

  async bulkAdd(toInsert: LocalWorkoutDetail[]): Promise<number> {
    return db.workoutDetails.bulkAdd(toInsert);
  },

  async update(
    detailId: number,
    toUpdate: Partial<LocalWorkoutDetail>
  ): Promise<number> {
    return db.workoutDetails.update(detailId, toUpdate);
  },

  async bulkPut(toUpdate: LocalWorkoutDetail[]): Promise<number> {
    return db.workoutDetails.bulkPut(toUpdate);
  },

  async delete(detailId: number) {
    return db.workoutDetails.delete(detailId);
  },
};
