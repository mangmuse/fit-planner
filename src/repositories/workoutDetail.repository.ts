import { db } from "@/lib/db";
import { BaseRepository } from "@/repositories/base.repository";
import { LocalWorkoutDetail } from "@/types/models";
import { IWorkoutDetailRepository } from "@/types/repositories";
import { Table } from "dexie";

export class WorkoutDetailRepository
  extends BaseRepository<LocalWorkoutDetail, number>
  implements IWorkoutDetailRepository
{
  constructor(table: Table<LocalWorkoutDetail, number>) {
    super(table);
  }

  async findAllByWorkoutId(workoutId: number): Promise<LocalWorkoutDetail[]> {
    return this.table.where("workoutId").equals(workoutId).toArray();
  }

  async findAllByWorkoutIdOrderByExerciseOrder(
    workoutId: number
  ): Promise<LocalWorkoutDetail[]> {
    return this.table
      .where("workoutId")
      .equals(workoutId)
      .sortBy("exerciseOrder");
  }

  async findAllByWorkoutIdAndExerciseOrder(
    workoutId: number,
    exerciseOrder: number
  ): Promise<LocalWorkoutDetail[]> {
    return this.table
      .where("workoutId")
      .equals(workoutId)
      .and((detail) => detail.exerciseOrder === exerciseOrder)
      .toArray();
  }

  async findAllDoneByExerciseId(
    exerciseId: number
  ): Promise<LocalWorkoutDetail[]> {
    return this.table
      .where("exerciseId")
      .equals(exerciseId)
      .and((detail) => detail.isDone === true)
      .toArray();
  }
}
