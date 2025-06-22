import {
  createBaseWorkoutDetailMock,
  mockWorkoutDetail,
} from "@/__mocks__/workoutDetail.mock";
import { WorkoutDetailRepository } from "@/repositories/workoutDetail.repository";
import { LocalWorkoutDetail } from "@/types/models";
import { IWorkoutDetailRepository } from "@/types/repositories";
import {
  createMockTable,
  setupMockWhereEqualsToArray,
} from "@/util/dbMockUtils";
import { toArray } from "lodash";

const mockTable = createMockTable<LocalWorkoutDetail, number>();

describe("WorkoutDetailRepository", () => {
  let repository: IWorkoutDetailRepository;

  beforeEach(() => {
    repository = new WorkoutDetailRepository(mockTable);
    jest.clearAllMocks();
  });
  it("findAllByWorkoutId", async () => {
    const mockWD = mockWorkoutDetail.past;
    const workoutId = mockWD.workoutId;

    const mockToArray = setupMockWhereEqualsToArray(mockTable, [mockWD]);

    const result = await repository.findAllByWorkoutId(workoutId);

    expect(mockTable.where("workoutId").equals).toHaveBeenCalledWith(workoutId);
    expect(mockToArray).toHaveBeenCalledTimes(1);
    expect(result).toEqual([mockWD]);
  });

  it("findAllByWorkoutIdOrderByExerciseOrder", async () => {
    const mockWD1 = {
      ...mockWorkoutDetail.past,
      exerciseOrder: 1,
      workoutId: 5,
    };
    const mockWD2 = {
      ...mockWorkoutDetail.past,
      exerciseOrder: 2,
      workoutId: 5,
    };
    const mockResult = [mockWD1, mockWD2];

    const mockSortBy = jest.fn().mockResolvedValue(mockResult);
    (mockTable.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        sortBy: mockSortBy,
      }),
    });

    const result = await repository.findAllByWorkoutIdOrderByExerciseOrder(5);

    expect(mockTable.where("workoutId").equals).toHaveBeenCalledWith(5);
    expect(mockSortBy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResult);
  });

  it("findAllByWorkoutIdAndExerciseOrder", async () => {
    const workoutId = 123;
    const exerciseOrder = 5;

    const detail1 = { ...mockWorkoutDetail.past, workoutId, exerciseOrder };
    const detail2 = { ...mockWorkoutDetail.past, workoutId, exerciseOrder: 6 };
    const detail3 = { ...mockWorkoutDetail.past, workoutId, exerciseOrder };

    const expectedResult = [detail1, detail3];

    const mockToArray = jest.fn().mockResolvedValue(expectedResult);
    const mockAnd = jest.fn().mockReturnValue({ toArray: mockToArray });

    (mockTable.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        and: mockAnd,
      }),
    });

    const result = await repository.findAllByWorkoutIdAndExerciseOrder(
      workoutId,
      exerciseOrder
    );

    expect(mockTable.where("workoutId").equals).toHaveBeenCalledWith(workoutId);
    expect(mockToArray).toHaveBeenCalledTimes(1);
    expect(mockAnd).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);

    const andCallback = mockAnd.mock.calls[0][0];
    expect(andCallback(detail2)).toBe(false);
    expect(andCallback(detail1)).toBe(true);
    expect(andCallback(detail3)).toBe(true);
  });

  it("findAllDoneByExerciseId", async () => {
    const exerciseId = 42;

    const detail1 = { ...mockWorkoutDetail.past, exerciseId, isDone: true };
    const detail2 = { ...mockWorkoutDetail.past, exerciseId, isDone: false };
    const detail3 = { ...mockWorkoutDetail.past, exerciseId, isDone: true };

    const expectedResult = [detail1, detail3];

    const mockToArray = jest.fn().mockResolvedValue(expectedResult);
    const mockAndMethod = jest.fn().mockReturnValue({ toArray: mockToArray });

    (mockTable.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        and: mockAndMethod,
      }),
    });

    const result = await repository.findAllDoneByExerciseId(exerciseId);

    expect(mockTable.where("exerciseId").equals).toHaveBeenCalledWith(
      exerciseId
    );
    expect(mockAndMethod).toHaveBeenCalledTimes(1);
    expect(mockToArray).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);

    const andCallback = mockAndMethod.mock.calls[0][0];
    expect(andCallback(detail1)).toBe(true);
    expect(andCallback(detail2)).toBe(false);
    expect(andCallback(detail3)).toBe(true);
  });
});
