import { createMock, DeepPartial } from "@/lib/test/createMock";
import { RoutineDetailWithIncludes } from "@/app/api/routine/detail/route";

export const createPrismaRoutineDetailResponse = (
  overrides?: DeepPartial<RoutineDetailWithIncludes>
): RoutineDetailWithIncludes => {
  const defaultRoutineDetail: RoutineDetailWithIncludes = {
    id: "routineDetail-1",
    routineId: "routine-1",
    exerciseId: 123,
    weight: 100,
    weightUnit: "kg",
    rpe: 10,
    exerciseOrder: 1,
    reps: 10,
    setOrder: 1,
    createdAt: new Date("2024-01-01T10:00:00Z"),
    setType: "NORMAL",
    updatedAt: new Date("2024-01-02T10:00:00Z"),
    exercise: {
      name: "벤치프레스",
    },
  };
  return createMock(defaultRoutineDetail, overrides);
};
