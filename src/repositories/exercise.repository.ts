import { BaseRepository } from "@/repositories/base.repository";
import { LocalExercise, Saved } from "@/types/models";
import { IExerciseRepository } from "@/types/repositories";
import { Table } from "dexie";

export class ExerciseRepository
  extends BaseRepository<LocalExercise, number>
  implements IExerciseRepository
{
  constructor(table: Table<LocalExercise, number>) {
    super(table);
  }

  async findAll(userId: string): Promise<Saved<LocalExercise>[]> {
    return this.table.where("userId").equals(userId).toArray() as Promise<
      Saved<LocalExercise>[]
    >;
  }

  async findOneByServerId(
    serverId: number
  ): Promise<Saved<LocalExercise> | undefined> {
    return this.table.where("serverId").equals(serverId).first() as Promise<
      Saved<LocalExercise> | undefined
    >;
  }

  async findAllUnsynced(): Promise<Saved<LocalExercise>[]> {
    return this.table.filter((ex) => !ex.isSynced).toArray() as Promise<
      Saved<LocalExercise>[]
    >;
  }
}
