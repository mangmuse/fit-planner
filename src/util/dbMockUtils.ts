import { db } from "@/lib/db";

type ActualTableNames = "exercises" | "workouts" | "workoutDetails";

export function mockWhereEqualsFirst(
  tableName: ActualTableNames,
  firstValue: unknown,
  once: boolean = false
) {
  (db[tableName].where as jest.Mock).mockReturnValue({
    equals: jest.fn().mockReturnValue({
      first: once
        ? jest.fn().mockResolvedValueOnce(firstValue)
        : jest.fn().mockResolvedValue(firstValue),
    }),
  });
}

export function mockWhereEqualsToArray(
  tableName: ActualTableNames,
  arrayValue: unknown[],
  once: boolean = false
) {
  (db[tableName].where as jest.Mock).mockReturnValue({
    equals: jest.fn().mockReturnValue({
      toArray: once
        ? jest.fn().mockResolvedValueOnce(arrayValue)
        : jest.fn().mockResolvedValue(arrayValue),
    }),
  });
}
