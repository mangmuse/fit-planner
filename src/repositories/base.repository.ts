import type { Table, UpdateSpec } from "dexie";
import type { LocalBase } from "@/types/models";
export abstract class BaseRepository<
  T extends LocalBase,
  TKey extends number | string,
> {
  constructor(protected table: Table<T, TKey>) {}

  public async clear(): Promise<void> {
    await this.table.clear();
  }

  // public async findAll(): Promise<T[]> {
  //   return this.table.toArray();
  // }

  public async findOneById(id: TKey): Promise<T | undefined> {
    return this.table.get(id);
  }

  public async add(toInsert: T): Promise<TKey> {
    return this.table.add(toInsert) as Promise<TKey>;
  }

  public async bulkAdd(toInsert: T[]): Promise<TKey> {
    return this.table.bulkAdd(toInsert) as Promise<TKey>;
  }

  public async bulkPut(toInsert: T[]): Promise<TKey> {
    return this.table.bulkPut(toInsert) as Promise<TKey>;
  }

  public async update(id: TKey, toUpdate: Partial<T>): Promise<number> {
    return this.table.update(id, toUpdate as UpdateSpec<T>);
  }

  public async delete(id: TKey): Promise<void> {
    await this.table.delete(id);
  }

  public async bulkDelete(ids: TKey[]): Promise<void> {
    await this.table.bulkDelete(ids);
  }
}
