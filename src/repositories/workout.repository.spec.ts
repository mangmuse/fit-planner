import { mockWorkout } from "@/__mocks__/workout.mock";
import { WorkoutRepository } from "@/repositories/workout.repository";
import { LocalWorkout } from "@/types/models";
import { IWorkoutRepository } from "@/types/repositories";
import { createMockTable, setupMockWhereEqualsFirst } from "@/util/dbMockUtils";

const mockTable = createMockTable<LocalWorkout, number>();

describe("WorkoutRepository", () => {
  let repository: IWorkoutRepository;

  beforeEach(() => {
    repository = new WorkoutRepository(mockTable);
    jest.clearAllMocks();
  });

  it("findOneByServerId", async () => {
    const mockW: LocalWorkout = mockWorkout.synced;
    const serverId = mockW.serverId;
    if (!serverId) {
      throw new Error("테스트용 mock 데이터에 serverId가 존재하지 않습니다.");
    }

    const mockFirst = setupMockWhereEqualsFirst(mockTable, mockW);

    const result = await repository.findOneByServerId(serverId);
    expect(mockTable.where("serverId").equals).toHaveBeenCalledWith(serverId);
    expect(mockFirst).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockW);
  });

  it("findOneByUserIdAndDate", async () => {
    const mockW = mockWorkout.planned;
    const userId = mockW.userId;
    const date = mockW.date;

    const mockFirst = setupMockWhereEqualsFirst(mockTable, mockW);

    const result = await repository.findOneByUserIdAndDate(userId, date);

    expect(mockTable.where(["userId", "date"]).equals).toHaveBeenCalledWith([
      userId,
      date,
    ]);
    expect(mockFirst).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockW);
  });

  it("findAllByUserIdOrderByDate", async () => {
    const userId = "user-123";
    const mockWorkout1 = { ...mockWorkout.planned, userId, date: "2025-06-21" };
    const mockWorkout2 = { ...mockWorkout.planned, userId, date: "2025-06-22" };

    const mockSortedArray = [mockWorkout1, mockWorkout2];

    const mockSortBy = jest.fn().mockResolvedValue(mockSortedArray);

    (mockTable.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        sortBy: mockSortBy,
      }),
    });

    const result = await repository.findAllByUserIdOrderByDate(userId);

    const expectedReversedArray = [mockWorkout2, mockWorkout1];

    expect(mockTable.where("userId").equals).toHaveBeenCalledWith(userId);
    expect(mockSortBy).toHaveBeenCalledWith("date");

    expect(result).toEqual(expectedReversedArray);
  });

  it("findAllByDateRangeExcludeEmpty", async () => {
    const startDate = "2025-06-01";
    const endDate = "2025-06-30";

    const workoutCompleted = {
      ...mockWorkout.planned,
      date: "2025-06-02",
      status: "COMPLETED",
    };
    const workoutEmpty = {
      ...mockWorkout.empty,
      date: "2025-06-02",
      status: "EMPTY",
    };
    const workoutPlanned = {
      ...mockWorkout.planned,
      date: "2025-06-02",
      status: "PLANNED",
    };

    const resultArray = [workoutCompleted, workoutPlanned];

    const mockToArray = jest.fn().mockResolvedValue(resultArray);
    const mockFilter = jest.fn().mockReturnValue({ toArray: mockToArray });
    const mockBetween = jest.fn().mockReturnValue({ filter: mockFilter });

    (mockTable.where as jest.Mock).mockReturnValueOnce({
      between: mockBetween,
    });

    const result = await repository.findAllByDateRangeExcludeEmpty(
      startDate,
      endDate
    );

    expect(mockTable.where).toHaveBeenCalledWith("date");

    expect(mockBetween).toHaveBeenCalledWith(startDate, endDate, true, true);
    expect(mockFilter).toHaveBeenCalledWith(expect.any(Function));
    expect(mockToArray).toHaveBeenCalledTimes(1);
    expect(result).toEqual(resultArray);

    const filterCallback = mockFilter.mock.calls[0][0];
    expect(filterCallback(workoutCompleted)).toBe(true);
    expect(filterCallback(workoutPlanned)).toBe(true);
    expect(filterCallback(workoutEmpty)).toBe(false);
  });
});
