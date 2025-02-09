import { LocalWorkoutDetail } from "@/types/models";

export const getGroupedDetails = (
  details: LocalWorkoutDetail[]
): { exerciseOrder: number; details: LocalWorkoutDetail[] }[] => {
  const groupedDetails = details.reduce((acc, detail) => {
    if (!acc.has(detail.exerciseOrder)) {
      acc.set(detail.exerciseOrder, []);
    }
    acc.get(detail.exerciseOrder)!.push(detail);
    return acc;
  }, new Map<number, LocalWorkoutDetail[]>());

  const groups = Array.from(groupedDetails, ([exerciseOrder, details]) => ({
    exerciseOrder,
    details,
  })).sort((a, b) => a.exerciseOrder - b.exerciseOrder);

  const adjustedGroups = groups.map((group, index) => ({
    exerciseOrder: index + 1,
    details: group.details,
  }));

  return adjustedGroups;
};
