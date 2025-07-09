import { db } from "@/lib/db";
import { BaseRepository } from "@/repositories/base.repository";
import { LocalWorkoutDetail, Saved } from "@/types/models";
import { IWorkoutDetailRepository } from "@/types/repositories";
import { Table } from "dexie";

export class WorkoutDetailRepository
  extends BaseRepository<LocalWorkoutDetail, number>
  implements IWorkoutDetailRepository
{
  constructor(table: Table<LocalWorkoutDetail, number>) {
    super(table);
  }

  async findAllByWorkoutId(
    workoutId: number
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.table.where("workoutId").equals(workoutId).toArray() as Promise<
      Saved<LocalWorkoutDetail>[]
    >;
  }

  async findAllByWorkoutIds(
    workoutIds: number[]
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.table.where("workoutId").anyOf(workoutIds).toArray() as Promise<
      Saved<LocalWorkoutDetail>[]
    >;
  }

  async findAllByWorkoutIdOrderByExerciseOrder(
    workoutId: number
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.table
      .where("workoutId")
      .equals(workoutId)
      .sortBy("exerciseOrder") as Promise<Saved<LocalWorkoutDetail>[]>;
  }

  async findAllByWorkoutIdAndExerciseOrder(
    workoutId: number,
    exerciseOrder: number
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.table
      .where("workoutId")
      .equals(workoutId)
      .and((detail) => detail.exerciseOrder === exerciseOrder)
      .toArray() as Promise<Saved<LocalWorkoutDetail>[]>;
  }

  async findAllByWorkoutIdAndExerciseOrderPairs(
    pairs: { workoutId: number; exerciseOrder: number }[]
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    if (pairs.length === 0) return [];

    const workoutIds = [...new Set(pairs.map((p) => p.workoutId))];

    return this.table
      .where("workoutId")
      .anyOf(workoutIds)
      .filter((detail) =>
        pairs.some(
          (pair) =>
            pair.workoutId === detail.workoutId &&
            pair.exerciseOrder === detail.exerciseOrder
        )
      )
      .toArray() as Promise<Saved<LocalWorkoutDetail>[]>;
  }

  async findAllDoneByExerciseId(
    exerciseId: number
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.table
      .where("exerciseId")
      .equals(exerciseId)
      .and((detail) => detail.isDone === true)
      .toArray() as Promise<Saved<LocalWorkoutDetail>[]>;
  }

  public async findAllByWorkoutIdAndExerciseId(
    workoutId: number,
    exerciseId: number
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.table
      .where("workoutId")
      .equals(workoutId)
      .and((detail) => detail.exerciseId === exerciseId)
      .toArray() as Promise<Saved<LocalWorkoutDetail>[]>;
  }
}
