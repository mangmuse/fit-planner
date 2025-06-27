import { getRoutines, getRoutineIds } from "./getRoutines";
import { prisma } from "@/lib/prisma";

describe("getRoutines utils", () => {
  const mockedPrismaRoutineFindMany = prisma.routine.findMany as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getRoutines", () => {
    const mockUserId = "user-123";
    const mockRoutines = [
      {
        id: "routine-1",
        userId: "user-123",
        name: "상체 루틴",
        description: "상체 운동 루틴",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "routine-2",
        userId: "user-123",
        name: "하체 루틴",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it("userId에 해당하는 routine 목록을 반환한다", async () => {
      mockedPrismaRoutineFindMany.mockResolvedValue(mockRoutines);

      const result = await getRoutines(mockUserId);

      expect(mockedPrismaRoutineFindMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toEqual(mockRoutines);
    });

    it("routine이 없으면 빈 배열을 반환한다", async () => {
      mockedPrismaRoutineFindMany.mockResolvedValue([]);

      const result = await getRoutines(mockUserId);

      expect(mockedPrismaRoutineFindMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toEqual([]);
    });

    it("prisma 에러가 발생하면 에러를 throw한다", async () => {
      const mockError = new Error("db 에러");
      mockedPrismaRoutineFindMany.mockRejectedValue(mockError);

      await expect(getRoutines(mockUserId)).rejects.toThrow(mockError.message);
      expect(mockedPrismaRoutineFindMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });
  });

  describe("getRoutineIds", () => {
    const mockUserId = "user-123";
    const mockRoutinesWithIds = [
      { id: "routine-1" },
      { id: "routine-2" },
      { id: "routine-3" },
    ];

    it("userId에 해당하는 routine ID 배열을 반환한다", async () => {
      mockedPrismaRoutineFindMany.mockResolvedValue(mockRoutinesWithIds);

      const result = await getRoutineIds(mockUserId);

      expect(mockedPrismaRoutineFindMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        select: { id: true },
      });
      expect(result).toEqual(["routine-1", "routine-2", "routine-3"]);
    });

    it("routine이 없으면 빈 배열을 반환한다", async () => {
      mockedPrismaRoutineFindMany.mockResolvedValue([]);

      const result = await getRoutineIds(mockUserId);

      expect(mockedPrismaRoutineFindMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        select: { id: true },
      });
      expect(result).toEqual([]);
    });

    it("prisma 에러가 발생하면 에러를 throw한다", async () => {
      const mockError = new Error("db 에러");
      mockedPrismaRoutineFindMany.mockRejectedValue(mockError);

      await expect(getRoutineIds(mockUserId)).rejects.toThrow(
        mockError.message
      );
      expect(mockedPrismaRoutineFindMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        select: { id: true },
      });
    });
  });
});
