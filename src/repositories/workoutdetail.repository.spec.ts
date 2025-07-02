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

  describe("findAllByWorkoutIdAndExerciseOrderPairs", () => {
    it("빈 배열인 경우 빈 배열을 반환한다", async () => {
      const result = await repository.findAllByWorkoutIdAndExerciseOrderPairs(
        []
      );
      expect(result).toEqual([]);
    });

    it("주어진 pairs에 해당하는 워크아웃 디테일들을 조회한다", async () => {
      const pairs = [
        { workoutId: 100, exerciseOrder: 1 },
        { workoutId: 100, exerciseOrder: 2 },
        { workoutId: 200, exerciseOrder: 1 },
      ];

      const detail1 = {
        ...mockWorkoutDetail.past,
        workoutId: 100,
        exerciseOrder: 1,
      };
      const detail2 = {
        ...mockWorkoutDetail.past,
        workoutId: 100,
        exerciseOrder: 2,
      };
      const detail3 = {
        ...mockWorkoutDetail.past,
        workoutId: 200,
        exerciseOrder: 1,
      };
      const detail4 = {
        ...mockWorkoutDetail.past,
        workoutId: 100,
        exerciseOrder: 3,
      };

      const expectedResult = [detail1, detail2, detail3];

      const mockToArray = jest.fn().mockResolvedValue(expectedResult);
      const mockFilter = jest.fn().mockReturnValue({ toArray: mockToArray });
      const mockAnyOf = jest.fn().mockReturnValue({ filter: mockFilter });

      (mockTable.where as jest.Mock).mockReturnValue({
        anyOf: mockAnyOf,
      });

      const result =
        await repository.findAllByWorkoutIdAndExerciseOrderPairs(pairs);

      expect(mockTable.where("workoutId").anyOf).toHaveBeenCalledWith([
        100, 200,
      ]);
      expect(mockFilter).toHaveBeenCalledTimes(1);
      expect(mockToArray).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);

      const filterCallback = mockFilter.mock.calls[0][0];
      expect(filterCallback(detail1)).toBe(true);
      expect(filterCallback(detail2)).toBe(true);
      expect(filterCallback(detail3)).toBe(true);
      expect(filterCallback(detail4)).toBe(false);
    });

    it("중복된 workoutId가 있어도 올바르게 처리한다", async () => {
      const pairs = [
        { workoutId: 100, exerciseOrder: 1 },
        { workoutId: 100, exerciseOrder: 2 },
      ];

      const mockToArray = jest.fn().mockResolvedValue([]);
      const mockFilter = jest.fn().mockReturnValue({ toArray: mockToArray });
      const mockAnyOf = jest.fn().mockReturnValue({ filter: mockFilter });

      (mockTable.where as jest.Mock).mockReturnValue({
        anyOf: mockAnyOf,
      });

      await repository.findAllByWorkoutIdAndExerciseOrderPairs(pairs);

      expect(mockTable.where("workoutId").anyOf).toHaveBeenCalledWith([100]);
    });
  });
});
