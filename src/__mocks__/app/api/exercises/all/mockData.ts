import { createMock, DeepPartial } from "@/lib/test/createMock";
import { ExerciseWithIncludes } from "@/app/api/exercises/all/route";

export const createPrismaExerciseResponse = (
  overrides?: DeepPartial<ExerciseWithIncludes>
): ExerciseWithIncludes => {
  const defaultEx: ExerciseWithIncludes = {
    id: 1,
    name: "벤치프레스",
    category: "가슴",
    isCustom: false,
    imageUrl: "",
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-02T10:00:00Z"),
    userId: null,
    userExercises: [
      {
        isBookmarked: false,
        unit: "kg",
        fixedExerciseMemo: null,
        dailyExerciseMemos: [],
      },
    ],
  };
  return createMock(defaultEx, overrides);
};
