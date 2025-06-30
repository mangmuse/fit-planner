import { DetailGroup } from "@/app/(main)/_shared/session/sessionSequence/SessionSequence";
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import { arrayMove } from "@dnd-kit/sortable";

export const getGroupedDetails = <
  T extends LocalWorkoutDetail | LocalRoutineDetail,
>(
  details: T[]
): {
  exerciseOrder: number;
  details: T[];
}[] => {
  const groupedDetails = details.reduce((acc, detail) => {
    if (!acc.has(detail.exerciseOrder)) {
      acc.set(detail.exerciseOrder, []);
    }
    acc.get(detail.exerciseOrder)!.push(detail);
    return acc;
  }, new Map<number, T[]>());

  const groups = Array.from(groupedDetails, ([exerciseOrder, details]) => {
    // 불변성을 유지하기 위해 새로운 객체 생성
    const sortedDetails = details
      .sort((a, b) => a.setOrder - b.setOrder)
      .map((detail, index) => ({
        ...detail,
        setOrder: index + 1,
        exerciseOrder,
      }));

    return {
      exerciseOrder,
      details: sortedDetails,
    };
  }).sort((a, b) => a.exerciseOrder - b.exerciseOrder);

  const adjustedGroups = groups.map((group, index) => ({
    exerciseOrder: index + 1,
    details: group.details.map((detail) => ({
      ...detail,
      exerciseOrder: index + 1,
    })),
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
