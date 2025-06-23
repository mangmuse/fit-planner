import {
  createBaseRoutineDetailMock,
  mockRoutineDetail,
} from "@/__mocks__/routineDetail.mock";
import { RoutineDetailRepository } from "@/repositories/routineDetail.repository";
import { LocalRoutineDetail } from "@/types/models";
import { IRoutineDetailRepository } from "@/types/repositories";
import {
  createMockTable,
  setupMockWhereEqualsToArray,
} from "@/util/dbMockUtils";

const mockTable = createMockTable<LocalRoutineDetail, number>();

describe("RoutineDetailRepository", () => {
  let repository: IRoutineDetailRepository;

  beforeEach(() => {
    repository = new RoutineDetailRepository(mockTable);
    jest.clearAllMocks();
  });

  it("findAllByRoutineId", async () => {
    const routineId = 999;
    const mockRD1 = createBaseRoutineDetailMock({
      routineId,
      exerciseOrder: 1,
      setOrder: 1,
    });
    const mockRD2 = createBaseRoutineDetailMock({
      routineId,
      exerciseOrder: 1,
      setOrder: 2,
    });
    const mockRD3 = createBaseRoutineDetailMock({
      routineId,
      exerciseOrder: 2,
      setOrder: 1,
    });

    const mockDetails = [mockRD1, mockRD2, mockRD3];
    const mockToArray = setupMockWhereEqualsToArray(mockTable, mockDetails);

    const result = await repository.findAllByRoutineId(routineId);

    expect(mockTable.where("routineId").equals).toHaveBeenCalledWith(routineId);
    expect(mockToArray).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockDetails);
  });
});
