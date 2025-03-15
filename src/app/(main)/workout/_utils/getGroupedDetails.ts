import { DetailGroup } from "@/app/(main)/workout/_components/WorkoutSequence";
import { LocalWorkoutDetail } from "@/types/models";
import { arrayMove } from "@dnd-kit/sortable";

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
    details: details.sort((a, b) => a.setOrder - b.setOrder),
  })).sort((a, b) => a.exerciseOrder - b.exerciseOrder);

  const adjustedGroups = groups.map((group, index) => ({
    exerciseOrder: index + 1,
    details: group.details,
  }));

  return adjustedGroups;
};

export const reorderDetailGroups = (
  groups: DetailGroup[],
  sourceId: string,
  destinationId: string
): DetailGroup[] => {
  const oldIndex = groups.findIndex(
    (group) => group.exerciseOrder.toString() === sourceId
  );
  const newIndex = groups.findIndex(
    (group) => group.exerciseOrder.toString() === destinationId
  );
  return arrayMove(groups, oldIndex, newIndex).map((group, index) => ({
    ...group,
    exerciseOrder: index + 1,
  }));
};
