import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
  NestedExercise,
  UserExercise,
  Saved,
} from "@/types/models";

export const createNestedStructure = <
  P extends number, // 부모 키
  T extends { id: P }, // 부모
  K extends PropertyKey, // 자식 키
  U extends Record<K, P>, // 자식
>(
  parents: T[],
  children: U[],
  foreignKey: K
): (T & { details: U[] })[] => {
  const childrenMap = new Map<P, U[]>();

  for (const child of children) {
    const key = child[foreignKey];
    if (!childrenMap.has(key)) {
      childrenMap.set(key, []);
    }
    childrenMap.get(key)!.push(child);
  }

  return parents.map((parent) => ({
    ...parent,
    details: childrenMap.get(parent.id) || [],
  }));
};

export const createNestedExercises = (
  exercises: Saved<LocalExercise>[]
): NestedExercise[] => {
  return exercises.map((exercise) => {
    const { isBookmarked, unit, exerciseMemo, ...exerciseData } = exercise;

    const userExercise: UserExercise | null =
      isBookmarked || unit !== "kg" || exerciseMemo
        ? {
            isBookmarked,
            unit,
            fixedMemo: exerciseMemo?.fixed ?? null,
            dailyMemos: exerciseMemo?.daily ?? [],
          }
        : null;

    const nested: NestedExercise = {
      ...exerciseData,
      userExercise,
    };

    return nested;
  });
};
