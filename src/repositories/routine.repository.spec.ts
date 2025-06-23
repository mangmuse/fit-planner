import { createBaseRoutineMock } from "@/__mocks__/routine.mock";
import { RoutineRepository } from "@/repositories/routine.repository";
import { LocalRoutine } from "@/types/models";
import { IRoutineRepository } from "@/types/repositories";
import {
  createMockTable,
  setupMockWhereEqualsFirst,
  setupMockWhereEqualsToArray,
} from "@/util/dbMockUtils";

const mockTable = createMockTable<LocalRoutine, number>();

describe("RoutineRepository", () => {
  let repository: IRoutineRepository;

  beforeEach(() => {
    repository = new RoutineRepository(mockTable);
    jest.clearAllMocks();
  });
  it("findOneByServerId", async () => {
    const mockR: LocalRoutine = createBaseRoutineMock();
    const serverId = mockR.serverId;
    if (!serverId) {
      throw new Error("테스트용 mock 데이터에 serverId가 존재하지 않습니다.");
    }

    const mockFirst = setupMockWhereEqualsFirst(mockTable, mockR);

    const result = await repository.findOneByServerId(serverId);

    expect(result).toEqual(mockR);
    expect(mockTable.where("serverId").equals).toHaveBeenCalledWith(serverId);
    expect(mockFirst).toHaveBeenCalledTimes(1);
  });

  it("findAllByUserId", async () => {
    const mockR = createBaseRoutineMock();
    const userId = mockR.userId;
    const mockToArray = setupMockWhereEqualsToArray(mockTable, [mockR]);

    const result = await repository.findAllByUserId(userId);

    expect(mockTable.where("userId").equals).toHaveBeenCalledWith(userId);
    expect(mockToArray).toHaveBeenCalledTimes(1);
    expect(result).toEqual([mockR]);
  });
});
