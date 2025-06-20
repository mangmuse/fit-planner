import { db } from "@/lib/db";
import { LocalRoutineDetail } from "@/types/models";

export const routineDetailRepository = {
  async clear() {
    db.routineDetails.clear();
  },

  async findAllByRoutineId(routineId: number): Promise<LocalRoutineDetail[]> {
    return db.routineDetails.where("routineId").equals(routineId).toArray();
  },

  async add(toInsert: LocalRoutineDetail): Promise<number> {
    return db.routineDetails.add(toInsert);
  },

  async findAll(): Promise<LocalRoutineDetail[]> {
    return db.routineDetails.toArray();
  },

  async bulkAdd(toInsert: LocalRoutineDetail[]): Promise<number> {
    return db.routineDetails.bulkAdd(toInsert);
  },

  async update(
    id: number,
    toUpdate: Partial<LocalRoutineDetail>
  ): Promise<number> {
    return db.routineDetails.update(id, toUpdate);
  },

  async delete(id: number): Promise<void> {
    await db.routineDetails.delete(id);
  },
};
