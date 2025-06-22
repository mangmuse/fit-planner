import { createMockExercise, mockExercise } from "@/__mocks__/exercise.mock";
import { ExerciseRepository } from "@/repositories/exercise.repository";
import { LocalExercise } from "@/types/models";
import { IExerciseRepository } from "@/types/repositories";
import {
  createMockTable,
  setupMockFilterToArray,
  setupMockWhereEqualsFirst,
} from "@/util/dbMockUtils";

const mockTable = createMockTable<LocalExercise, number>();
describe("ExerciseRepository", () => {
  let repository: IExerciseRepository;

  beforeEach(() => {
    repository = new ExerciseRepository(mockTable);
    jest.clearAllMocks();
  });

  it("findOneByServerId", async () => {
    const mockEx = mockExercise.synced;
    const serverId = mockEx.serverId;
    if (!serverId)
      throw new Error("테스트용 mock 데이터에 serverId가 존재하지 않습니다.");

    const mockFirst = setupMockWhereEqualsFirst(mockTable, mockEx);

    const result = await repository.findOneByServerId(serverId);

    expect(mockTable.where("serverId").equals).toHaveBeenCalledWith(serverId);
    expect(mockFirst).toHaveBeenCalledTimes(1);

    expect(result).toEqual(mockEx);
  });

  it("findAllUnsynced", async () => {
    const mockUnsynced = createMockExercise({ isSynced: false });

    const mockToArray = setupMockFilterToArray(mockTable, [mockUnsynced]);

    const result = await repository.findAllUnsynced();

    expect(mockTable.filter).toHaveBeenCalledTimes(1);
    expect(mockToArray).toHaveBeenCalledTimes(1);

    expect(result).toEqual([mockUnsynced]);

    const filterCallback = (mockTable.filter as jest.Mock).mock.calls[0][0];

    const mockedSynced = createMockExercise({ isSynced: true });
    expect(filterCallback(mockedSynced)).toBe(false);
    expect(filterCallback(mockUnsynced)).toBe(true);

    //
  });
});
