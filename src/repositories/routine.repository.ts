import { db } from "@/lib/db";
import { BaseRepository } from "@/repositories/base.repository";
import { LocalRoutine } from "@/types/models";
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

  async findOneByServerId(serverId: string): Promise<LocalRoutine | undefined> {
    return this.table.where("serverId").equals(serverId).first();
  }

  async findAllByUserId(userId: string) {
    return this.table.where("userId").equals(userId).toArray();
  }
}
