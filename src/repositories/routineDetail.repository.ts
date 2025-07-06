import { db } from "@/lib/db";
import { BaseRepository } from "@/repositories/base.repository";
import { LocalRoutineDetail, Saved } from "@/types/models";
import { IRoutineDetailRepository } from "@/types/repositories";
import { Table } from "dexie";

export class RoutineDetailRepository
  extends BaseRepository<LocalRoutineDetail, number>
  implements IRoutineDetailRepository
{
  constructor(table: Table<LocalRoutineDetail, number>) {
    super(table);
  }

  public async findAllByRoutineId(
    routineId: number
  ): Promise<Saved<LocalRoutineDetail>[]> {
    return this.table.where("routineId").equals(routineId).toArray() as Promise<
      Saved<LocalRoutineDetail>[]
    >;
  }

  public async findAllByRoutineIds(
    routineIds: number[]
  ): Promise<Saved<LocalRoutineDetail>[]> {
    return this.table.where("routineId").anyOf(routineIds).toArray() as Promise<
      Saved<LocalRoutineDetail>[]
    >;
  }
}
