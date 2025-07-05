import { BaseRepository } from "@/repositories/base.repository";
import { LocalBase } from "@/types/models";
import { Table } from "dexie";

interface TestEntity extends LocalBase {
  name: string;
  description: string;
}

class TestRepository extends BaseRepository<TestEntity, number> {
  constructor(table: Table<TestEntity, number>) {
    super(table);
  }
}

const mockTable = {
  clear: jest.fn(),
  toArray: jest.fn(),
  get: jest.fn(),
  add: jest.fn(),
  bulkAdd: jest.fn(),
  bulkPut: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  bulkDelete: jest.fn(),
} as unknown as Table<TestEntity, number>;

describe("BaseRepository", () => {
  let repository: TestRepository;

  beforeEach(() => {
    repository = new TestRepository(mockTable);

    jest.clearAllMocks();
  });

  it("clear 메서드는 table.clear를 호출한다", async () => {
    await repository.clear();
    expect(mockTable.clear).toHaveBeenCalledTimes(1);
  });

  it("findOneById 메서드는 전달받은 id와 함께 table.findOneById를 호출한다", async () => {
    const mockEntity: TestEntity = { id: 1, name: "멍멍이", description: "개" };
    (mockTable.get as jest.Mock).mockResolvedValue(mockEntity);

    const idToFind = 1;
    const result = await repository.findOneById(idToFind);
    expect(mockTable.get).toHaveBeenCalledTimes(1);
    expect(mockTable.get).toHaveBeenCalledWith(idToFind);

    expect(result).toEqual(mockEntity);
  });
  it("add 메서드는 전달받은 toInsert 와 함께 table.add 를 호출한다", async () => {
    const mockId = 10;
    const toInsert = { name: "멍멍이", description: "개" };

    (mockTable.add as jest.Mock).mockResolvedValue(mockId);

    const result = await repository.add(toInsert);
    expect(mockTable.add).toHaveBeenCalledTimes(1);
    expect(mockTable.add).toHaveBeenCalledWith(toInsert);

    expect(result).toBe(mockId);
  });
  it("bulkAdd 메서드는 전달받은 toInsert 와 함께 table.bulkAdd 를 호출한다", async () => {
    const mockId = 10;
    const toInsert = [{ name: "멍멍이", description: "개" }];

    (mockTable.bulkAdd as jest.Mock).mockResolvedValue(mockId);

    const result = await repository.bulkAdd(toInsert);
    expect(mockTable.bulkAdd).toHaveBeenCalledTimes(1);
    expect(mockTable.bulkAdd).toHaveBeenCalledWith(toInsert);

    expect(result).toBe(mockId);
  });
  it("bulkPut 메서드는 전달받은 toInsert와 함께 table.bulkPut를 호출한다", async () => {
    const toInsert = [{ name: "멍멍이", description: "개" }];

    const mockId = 11;
    (mockTable.bulkPut as jest.Mock).mockResolvedValue(mockId);

    const result = await repository.bulkPut(toInsert);
    expect(mockTable.bulkPut).toHaveBeenCalledTimes(1);
    expect(mockTable.bulkPut).toHaveBeenCalledWith(toInsert);

    expect(result).toBe(mockId);
  });
  it("update 메서드는 전달받은 toUpdate 와 함께 table.update 를 호출한다", async () => {
    const mockId = 1;
    const toUpdate = { name: "멍멍이", description: "개" };

    (mockTable.update as jest.Mock).mockResolvedValue(mockId);

    const result = await repository.update(mockId, toUpdate);
    expect(mockTable.update).toHaveBeenCalledTimes(1);
    expect(mockTable.update).toHaveBeenCalledWith(mockId, toUpdate);

    expect(result).toBe(mockId);
  });

  it("delete", async () => {
    const mockId = 1;

    await repository.delete(mockId);

    expect(mockTable.delete).toHaveBeenCalledTimes(1);
    expect(mockTable.delete).toHaveBeenCalledWith(mockId);
  });

  it("bulkDelete 메서드는 전달받은 ids와 함께 table.bulkDelete를 호출한다", async () => {
    const mockIds = [1, 2, 3];

    await repository.bulkDelete(mockIds);

    expect(mockTable.bulkDelete).toHaveBeenCalledTimes(1);
    expect(mockTable.bulkDelete).toHaveBeenCalledWith(mockIds);
  });
});
