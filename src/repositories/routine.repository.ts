import { db } from "@/lib/db";
import { BaseRepository } from "@/repositories/base.repository";
import { LocalRoutine, LocalRoutineDetail, Saved } from "@/types/models";
import { IRoutineRepository } from "@/types/repositories";
import { Table } from "dexie";

export class RoutineRepository
  extends BaseRepository<LocalRoutine, number>
  implements IRoutineRepository
{
  constructor(
    table: Table<LocalRoutine, number> //
  ) {
    super(table);
  }

  async findAll(userId: string): Promise<Saved<LocalRoutine>[]> {
    return this.table.where("userId").equals(userId).toArray() as Promise<
      Saved<LocalRoutine>[]
    >;
  }

  async findOneByServerId(serverId: string): Promise<Saved<LocalRoutine> | undefined> {
    return this.table.where("serverId").equals(serverId).first() as Promise<
      Saved<LocalRoutine> | undefined
    >;
  }

  async findAllByUserId(userId: string): Promise<Saved<LocalRoutine>[]> {
    return this.table.where("userId").equals(userId).toArray() as Promise<
      Saved<LocalRoutine>[]
    >;
  }
}
