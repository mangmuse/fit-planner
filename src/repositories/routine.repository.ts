import { db } from "@/lib/db";
import { LocalRoutine } from "@/types/models";

export const routineRepository = {
  async clear(): Promise<void> {
    await db.routines.clear();
  },

  async findOneById(id: number): Promise<LocalRoutine | undefined> {
    return db.routines.get(id);
  },

  async findOneByServerId(serverId: string): Promise<LocalRoutine | undefined> {
    return db.routines.where("serverId").equals(serverId).first();
  },

  async findAll(): Promise<LocalRoutine[]> {
    return db.routines.toArray();
  },

  async findAllByUserId(userId: string) {
    return db.routines.where("userId").equals(userId).toArray();
  },

  async add(toInsert: LocalRoutine): Promise<number> {
    return db.routines.add(toInsert);
  },

  async bulkAdd(toInsert: LocalRoutine[]): Promise<number> {
    return db.routines.bulkAdd(toInsert);
  },

  async update(id: number, toUpdate: Partial<LocalRoutine>): Promise<number> {
    return db.routines.update(id, toUpdate);
  },

  async delete(id: number): Promise<void> {
    await db.routines.delete(id);
  },
};
