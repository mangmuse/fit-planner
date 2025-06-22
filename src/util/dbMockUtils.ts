import { db } from "@/lib/db";
import { Table } from "dexie";

type ActualTableNames = "exercises" | "workouts" | "workoutDetails";

export function setupMockWhereEqualsFirst<T>(
  mockTable: jest.Mocked<Table<T>>,
  result: T | undefined
) {
  const mockFirst = jest.fn().mockResolvedValue(result);

  (mockTable.where as jest.Mock).mockReturnValue({
    equals: jest.fn().mockReturnValue({
      first: mockFirst,
    }),
  });

  return mockFirst;
}

export function setupMockWhereEqualsToArray<T>(
  mockTable: jest.Mocked<Table<T>>,
  result: T[]
) {
  const mockToArray = jest.fn().mockResolvedValue(result);

  (mockTable.where as jest.Mock).mockReturnValue({
    equals: jest.fn().mockReturnValue({
      toArray: mockToArray,
    }),
  });

  return mockToArray;
}

export function setupMockFilterToArray<T>(
  mockTable: jest.Mocked<Table<T>>,
  result: T[]
) {
  const mockToArray = jest.fn().mockResolvedValue(result);
  (mockTable.filter as jest.Mock).mockReturnValue({
    toArray: mockToArray,
  });
  return mockToArray;
}

// export function mockWhereEqualsFirst(
//   tableName: ActualTableNames,
//   firstValue: unknown,
//   once: boolean = false
// ) {
//   (db[tableName].where as jest.Mock).mockReturnValue({
//     equals: jest.fn().mockReturnValue({
//       first: once
//         ? jest.fn().mockResolvedValueOnce(firstValue)
//         : jest.fn().mockResolvedValue(firstValue),
//     }),
//   });
// }

// export function mockWhereEqualsToArray(
//   tableName: ActualTableNames,
//   arrayValue: unknown[],
//   once: boolean = false
// ) {
//   (db[tableName].where as jest.Mock).mockReturnValue({
//     equals: jest.fn().mockReturnValue({
//       toArray: once
//         ? jest.fn().mockResolvedValueOnce(arrayValue)
//         : jest.fn().mockResolvedValue(arrayValue),
//     }),
//   });
// }

export function createMockTable<T, TKey>() {
  return {
    get: jest.fn(),
    put: jest.fn(),
    add: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    bulkAdd: jest.fn(),
    where: jest.fn(),
    filter: jest.fn(),
  } as unknown as jest.Mocked<Table<T, TKey>>;
}
