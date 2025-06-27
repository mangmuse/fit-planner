import { getWorkouts, getWorkoutIds } from "./getWorkouts";
import { prisma } from "@/lib/prisma";

describe("getWorkouts utils", () => {
  const mockedPrismaWorkoutFindMany = prisma.workout.findMany as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getWorkouts", () => {
    const mockUserId = "user-123";
    const mockWorkouts = [
      {
        id: "workout-1",
        userId: "user-123",
        date: new Date("2024-01-01"),
        status: "COMPLETED",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "workout-2",
        userId: "user-123",
        date: new Date("2024-01-02"),
        status: "IN_PROGRESS",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it("userId에 해당하는 workout 목록을 반환한다", async () => {
      mockedPrismaWorkoutFindMany.mockResolvedValue(mockWorkouts);

      const result = await getWorkouts(mockUserId);

      expect(mockedPrismaWorkoutFindMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toEqual(mockWorkouts);
    });

    it("workout이 없으면 빈 배열을 반환한다", async () => {
      mockedPrismaWorkoutFindMany.mockResolvedValue([]);

      const result = await getWorkouts(mockUserId);

      expect(mockedPrismaWorkoutFindMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toEqual([]);
    });

    it("prisma 에러가 발생하면 에러를 throw한다", async () => {
      const mockError = new Error("db 에러");
      mockedPrismaWorkoutFindMany.mockRejectedValue(mockError);

      await expect(getWorkouts(mockUserId)).rejects.toThrow(mockError.message);
      expect(mockedPrismaWorkoutFindMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });
  });

  describe("getWorkoutIds", () => {
    const mockUserId = "user-123";
    const mockWorkoutsWithIds = [
      { id: "workout-1" },
      { id: "workout-2" },
      { id: "workout-3" },
    ];

    it("userId에 해당하는 workout ID 배열을 반환한다", async () => {
      mockedPrismaWorkoutFindMany.mockResolvedValue(mockWorkoutsWithIds);

      const result = await getWorkoutIds(mockUserId);

      expect(mockedPrismaWorkoutFindMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        select: { id: true },
      });
      expect(result).toEqual(["workout-1", "workout-2", "workout-3"]);
    });

    it("workout이 없으면 빈 배열을 반환한다", async () => {
      mockedPrismaWorkoutFindMany.mockResolvedValue([]);

      const result = await getWorkoutIds(mockUserId);

      expect(mockedPrismaWorkoutFindMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        select: { id: true },
      });
      expect(result).toEqual([]);
    });

    it("prisma 에러가 발생하면 에러를 throw한다", async () => {
      const mockError = new Error("db 에러");
      mockedPrismaWorkoutFindMany.mockRejectedValue(mockError);

      await expect(getWorkoutIds(mockUserId)).rejects.toThrow(
        mockError.message
      );
      expect(mockedPrismaWorkoutFindMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        select: { id: true },
      });
    });
  });
});
