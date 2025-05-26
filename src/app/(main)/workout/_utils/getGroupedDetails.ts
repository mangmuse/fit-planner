import { DetailGroup } from "@/app/(main)/workout/_components/WorkoutSequence";
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import { arrayMove } from "@dnd-kit/sortable";

export const getGroupedDetails = (
  details: LocalWorkoutDetail[] | LocalRoutineDetail[]
): {
  exerciseOrder: number;
  details: LocalWorkoutDetail[] | LocalRoutineDetail[];
}[] => {
  console.log(details);
  const groupedDetails = details.reduce((acc, detail) => {
    if (!acc.has(detail.exerciseOrder)) {
      acc.set(detail.exerciseOrder, []);
    }
    acc.get(detail.exerciseOrder)!.push(detail);
    return acc;
  }, new Map<number, (LocalWorkoutDetail | LocalRoutineDetail)[]>());
  const groups = Array.from(groupedDetails, ([exerciseOrder, details]) => ({
    exerciseOrder,
    details: details.sort((a, b) => a.setOrder - b.setOrder),
  })).sort((a, b) => a.exerciseOrder - b.exerciseOrder);
  console.log(groups);
  const adjustedGroups = groups.map((group, index) => ({
    exerciseOrder: index + 1,
    details: group.details,
  }));
  console.log(adjustedGroups);

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
