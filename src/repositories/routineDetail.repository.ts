import { db } from "@/lib/db";
import { BaseRepository } from "@/repositories/base.repository";
import { LocalRoutineDetail } from "@/types/models";
import { IRoutineDetailRepository } from "@/types/repositories";
import { Table } from "dexie";

export class RoutineDetailRepository
  extends BaseRepository<LocalRoutineDetail, number>
  implements IRoutineDetailRepository
{
  constructor(table: Table<LocalRoutineDetail, number>) {
    super(table);
  }

  async findAllByRoutineId(routineId: number): Promise<LocalRoutineDetail[]> {
    return this.table.where("routineId").equals(routineId).toArray();
  }
}
