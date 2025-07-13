import {
  isWorkoutDetail,
  isWorkoutDetails,
} from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { SessionGroup } from "@/hooks/useLoadDetails";
import { LocalRoutineDetail, LocalWorkoutDetail, Saved } from "@/types/models";
import { useCallback, Dispatch, SetStateAction } from "react";

type UseDetailsOperationsProps = {
  workoutGroups: SessionGroup[];
  setWorkoutGroups: Dispatch<SetStateAction<SessionGroup[]>>;
};

const insertDetailAfterLastDetail = <
  T extends Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>,
>(
  details: T[],
  lastDetail: T,
  newDetail: T
): T[] => {
  const lastIndex = details.findIndex((d) => d.id === lastDetail.id);
  const newDetails = [...details];
  newDetails.splice(lastIndex + 1, 0, newDetail);
  return newDetails;
};

export const useDetailsOperations = ({
  workoutGroups,
  setWorkoutGroups,
}: UseDetailsOperationsProps) => {
  const updateDetailInGroups = useCallback(
    (updatedDetail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>) => {
      setWorkoutGroups((prevGroups: SessionGroup[]) =>
        prevGroups.map((group) => {
          const hasDetail = group.details.some(
            (d) => d.id === updatedDetail.id
          );
          if (!hasDetail) return group; // 참조 유지

          return {
            ...group,
            details: group.details.map((d) =>
              d.id === updatedDetail.id ? updatedDetail : d
            ),
          };
        })
      );
    },
    [setWorkoutGroups]
  );

  const addDetailToGroup = useCallback(
    (
      newDetail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>,
      lastDetail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>
    ) => {
      setWorkoutGroups((prevGroups: SessionGroup[]) =>
        prevGroups.map((group) => {
          const hasLastDetail = group.details.some(
            (d) => d.id === lastDetail.id
          );
          if (!hasLastDetail) return group;

          const isWorkoutGroup = isWorkoutDetails(group.details);
          const isWorkoutNewDetail = isWorkoutDetail(newDetail);

          if (isWorkoutGroup === isWorkoutNewDetail) {
            if (isWorkoutGroup) {
              const newDetails = insertDetailAfterLastDetail(
                group.details as Saved<LocalWorkoutDetail>[],
                lastDetail as Saved<LocalWorkoutDetail>,
                newDetail as Saved<LocalWorkoutDetail>
              );
              return {
                ...group,
                details: newDetails,
              };
            } else {
              const newDetails = insertDetailAfterLastDetail(
                group.details as Saved<LocalRoutineDetail>[],
                lastDetail as Saved<LocalRoutineDetail>,
                newDetail as Saved<LocalRoutineDetail>
              );
              return {
                ...group,
                details: newDetails,
              };
            }
          }

          return group;
        })
      );
    },
    [setWorkoutGroups]
  );

  const removeDetailFromGroup = useCallback(
    (detailId: number) => {
      setWorkoutGroups((prevGroups: SessionGroup[]) => {
        let deletedOrder: number | null = null;

        const filteredGroups = prevGroups
          .map((group) => {
            const hasDetail = group.details.some((d) => d.id === detailId);
            if (!hasDetail) return group;

            const newDetails = group.details.filter((d) => d.id !== detailId);

            if (newDetails.length === 0) {
              deletedOrder = group.exerciseOrder;
              return null;
            }

            return {
              ...group,
              details: newDetails,
            };
          })
          .filter(Boolean) as SessionGroup[];

        if (deletedOrder !== null) {
          return filteredGroups.map((group) => ({
            ...group,
            exerciseOrder:
              group.exerciseOrder > deletedOrder!
                ? group.exerciseOrder - 1
                : group.exerciseOrder,
          }));
        }

        return filteredGroups;
      });
    },
    [setWorkoutGroups]
  );

  const updateMultipleDetailsInGroups = useCallback(
    (
      updatedDetails: (Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>)[]
    ) => {
      const updatedDetailsMap = new Map(
        updatedDetails.map((detail) => [detail.id, detail])
      );

      setWorkoutGroups((prevGroups: SessionGroup[]) =>
        prevGroups.map((group) => {
          const hasChanges = group.details.some((detail) =>
            updatedDetailsMap.has(detail.id)
          );

          if (!hasChanges) return group; // 참조 유지

          return {
            ...group,
            details: group.details.map((detail) => {
              const updatedDetail = updatedDetailsMap.get(detail.id);
              return updatedDetail || detail;
            }),
          };
        })
      );
    },
    [setWorkoutGroups]
  );

  const removeMultipleDetailsInGroup = useCallback(
    (details: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[]) => {
      setWorkoutGroups((prevGroups: SessionGroup[]) =>
        prevGroups
          .filter(
            (group) =>
              !details.some((d) => group.details.some((g) => g.id === d.id))
          )
          .map((group, idx) => ({
            ...group,
            exerciseOrder: idx + 1,
          }))
      );
    },
    [setWorkoutGroups]
  );

  return {
    removeDetailFromGroup,
    updateDetailInGroups,
    addDetailToGroup,
    updateMultipleDetailsInGroups,
    removeMultipleDetailsInGroup,
  };
};
