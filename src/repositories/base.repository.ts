import type { Table, UpdateSpec } from "dexie";
import type { LocalBase } from "@/types/models";
export abstract class BaseRepository<
  T extends LocalBase,
  TKey extends number | string,
> {
  constructor(protected table: Table<T, TKey>) {}

  async clear(): Promise<void> {
    await this.table.clear();
  }

  async findAll(): Promise<T[]> {
    return this.table.toArray();
  }

  async findOneById(id: TKey): Promise<T | undefined> {
    return this.table.get(id);
  }

  async add(toInsert: T): Promise<TKey> {
    return this.table.add(toInsert) as Promise<TKey>;
  }

  async bulkAdd(toInsert: T[]): Promise<TKey> {
    return this.table.bulkAdd(toInsert) as Promise<TKey>;
  }

  async bulkPut(toInsert: T[]): Promise<TKey> {
    return this.table.bulkPut(toInsert) as Promise<TKey>;
  }

  async update(id: TKey, toUpdate: Partial<T>): Promise<number> {
    return this.table.update(id, toUpdate as UpdateSpec<T>);
  }

  async delete(id: TKey): Promise<void> {
    await this.table.delete(id);
  }

  async bulkDelete(ids: TKey[]): Promise<void> {
    await this.table.bulkDelete(ids);
  }
}
