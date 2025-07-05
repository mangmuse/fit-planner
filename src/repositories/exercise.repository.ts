import { BaseRepository } from "@/repositories/base.repository";
import { LocalExercise } from "@/types/models";
import { IExerciseRepository } from "@/types/repositories";
import { Table } from "dexie";

export class ExerciseRepository
  extends BaseRepository<LocalExercise, number>
  implements IExerciseRepository
{
  constructor(table: Table<LocalExercise, number>) {
    super(table);
  }

  async findAll(userId: string): Promise<LocalExercise[]> {
    return this.table.where("userId").equals(userId).toArray();
  }

  async findOneByServerId(
    serverId: number
  ): Promise<LocalExercise | undefined> {
    return this.table.where("serverId").equals(serverId).first();
  }

  async findAllUnsynced(): Promise<LocalExercise[]> {
    return this.table.filter((ex) => !ex.isSynced).toArray();
  }
}
