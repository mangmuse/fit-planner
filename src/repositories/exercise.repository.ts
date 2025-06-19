import { db } from "@/lib/db";
import { LocalExercise } from "@/types/models";

export const exerciseRepository = {
  async clear(): Promise<void> {
    await db.exercises.clear();
  },

  async findOneById(id: number): Promise<LocalExercise | undefined> {
    return db.exercises.where("id").equals(id).first();
  },

  async findOneByServerId(
    serverId: number
  ): Promise<LocalExercise | undefined> {
    return db.exercises.where("serverId").equals(serverId).first();
  },

  async findAll(): Promise<LocalExercise[]> {
    return db.exercises.toArray();
  },

  async findAllUnsynced(): Promise<LocalExercise[]> {
    return db.exercises.filter((ex) => !ex.isSynced).toArray();
  },

  async add(toInsert: LocalExercise): Promise<number> {
    return db.exercises.add(toInsert);
  },

  async bulkAdd(toInsert: LocalExercise[]): Promise<number> {
    return db.exercises.bulkAdd(toInsert);
  },

  async update(id: number, toUpdate: Partial<LocalExercise>): Promise<number> {
    return db.exercises.update(id, toUpdate);
  },

  async bulkPut(toUpdate: LocalExercise[]): Promise<number> {
    return db.exercises.bulkPut(toUpdate);
  },

  async delete(id: number): Promise<void> {
    await db.exercises.delete(id);
  },
};
