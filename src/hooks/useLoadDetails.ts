import {
  isWorkoutDetail,
  isWorkoutDetails,
} from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import {
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
  Saved,
} from "@/types/models";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  routineDetailService,
  workoutDetailService,
  workoutService,
} from "@/lib/di";

type UseLoadDetailsProps = {
  type: "RECORD" | "ROUTINE";
  userId: string;
  date?: string;
  routineId?: number;
};

export type SessionGroup = {
  exerciseOrder: number;
  details: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[];
};

const useLoadDetails = ({
  type,
  userId,
  date,
  routineId,
}: UseLoadDetailsProps) => {
  const [workout, setWorkout] = useState<LocalWorkout | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [allDetails, setAllDetails] = useState<
    Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[]
  >([]);
  const [workoutGroups, setWorkoutGroups] = useState<SessionGroup[]>([]);

  const loadLocalDetails = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      if (type === "RECORD") {
        if (!userId || !date) return;
        const details = await workoutDetailService.getLocalWorkoutDetails(
          userId,
          date
        );
        setAllDetails(details);
        const adjustedGroups = getGroupedDetails(details);

        setWorkoutGroups(adjustedGroups);
      } else if (type === "ROUTINE") {
        if (!userId || !routineId) return;
        const details =
          await routineDetailService.getLocalRoutineDetails(routineId);
        setAllDetails(details);
        const adjustedGroups = getGroupedDetails(details);
        setWorkoutGroups(adjustedGroups);
      }
    } catch (e) {
      console.error(e);
      setError("운동 세부 정보를 불러오는데 실패했습니다");
    } finally {
      setIsInitialLoading(false);
    }
  }, [type, userId, date, routineId]);

  const syncWorkoutStatus = async () => {
    try {
      if (!date || !userId) return;

      let currentWorkout = workout;
      if (!currentWorkout) {
        const fetchedWorkout = await workoutService.getWorkoutByUserIdAndDate(
          userId,
          date
        );
        currentWorkout = fetchedWorkout || null;
        if (!currentWorkout) {
          // 최초 렌더링이나 workout이 아직 생성되지 않은 경우
          return;
        }
        setWorkout(currentWorkout);
      }
      if (!currentWorkout?.id || currentWorkout.status === "COMPLETED") return;
      const newStatus = workoutGroups.length === 0 ? "EMPTY" : "PLANNED";
      await workoutService.updateLocalWorkout({
        ...currentWorkout,
        status: newStatus,
      });
    } catch (e) {
      console.error("[useLoadDetails] Error", e);
      setError("운동 상태를 동기화하는데 실패했습니다");
    }
  };

  useEffect(() => {
    (async () => {
      await loadLocalDetails();
    })();
  }, [type, userId, date, routineId]);

  useEffect(() => {
    if (type === "RECORD" && date) {
      syncWorkoutStatus();
    }
  }, [workoutGroups]);

  const updateDetailInGroups = useCallback(
    (updatedDetail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>) => {
      setWorkoutGroups((prevGroups) =>
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

      setAllDetails((prev) =>
        prev.map((d) => (d.id === updatedDetail.id ? updatedDetail : d))
      );
    },
    []
  );

  const addDetailToGroup = useCallback(
    (
      newDetail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>,
      lastDetail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>
    ) => {
      setWorkoutGroups((prevGroups) =>
        prevGroups.map((group) => {
          const hasLastDetail = group.details.some(
            (d) => d.id === lastDetail.id
          );
          if (!hasLastDetail) return group;

          if (isWorkoutDetails(group.details) && isWorkoutDetail(newDetail)) {
            const lastIndex = group.details.findIndex(
              (d) => d.id === lastDetail.id
            );
            const newDetails = [...group.details];
            newDetails.splice(lastIndex + 1, 0, newDetail);

            return {
              ...group,
              details: newDetails,
            };
          } else if (
            !isWorkoutDetails(group.details) &&
            !isWorkoutDetail(newDetail)
          ) {
            const lastIndex = group.details.findIndex(
              (d) => d.id === lastDetail.id
            );
            const newDetails = [...group.details];
            newDetails.splice(lastIndex + 1, 0, newDetail);

            return {
              ...group,
              details: newDetails,
            };
          }

          return group;
        })
      );

      setAllDetails((prev) => {
        if (isWorkoutDetails(prev) && isWorkoutDetail(newDetail)) {
          const lastIndex = prev.findIndex((d) => d.id === lastDetail.id);
          const newAll = [...prev];
          newAll.splice(lastIndex + 1, 0, newDetail);
          return newAll;
        } else if (!isWorkoutDetails(prev) && !isWorkoutDetail(newDetail)) {
          const lastIndex = prev.findIndex((d) => d.id === lastDetail.id);
          const newAll = [...prev];
          newAll.splice(lastIndex + 1, 0, newDetail);
          return newAll;
        }
        return prev;
      });
    },
    []
  );

  const removeDetailFromGroup = useCallback((detailId: number) => {
    setWorkoutGroups((prevGroups) => {
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

    setAllDetails((prev) => {
      if (isWorkoutDetails(prev)) {
        return prev.filter((d) => d.id !== detailId);
      } else {
        return prev.filter((d) => d.id !== detailId);
      }
    });
  }, []);

  return {
    error,
    isLoading: isInitialLoading,
    allDetails,
    setAllDetails,
    workout,
    workoutGroups,
    reload: loadLocalDetails,
    setWorkout,
    updateDetailInGroups,
    addDetailToGroup,
    removeDetailFromGroup,
  };
};

export default useLoadDetails;
