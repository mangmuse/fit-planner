import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import { SessionGroup } from "@/hooks/useLoadDetails";
import {
  routineDetailService,
  workoutDetailService,
  workoutService,
} from "@/lib/di";
import {
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
  Saved,
} from "@/types/models";
import { SessionDetailType } from "@/types/services";
import { useCallback, useEffect, useState } from "react";

export const useDetailsData = (
  type: SessionDetailType,
  userId: string,
  date?: string,
  routineId?: number
) => {
  const [workout, setWorkout] = useState<Saved<LocalWorkout> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
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
        const adjustedGroups = getGroupedDetails(details);
        setWorkoutGroups(adjustedGroups);
      } else if (type === "ROUTINE") {
        if (!userId || !routineId) return;
        const details =
          await routineDetailService.getLocalRoutineDetails(routineId);
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
  }, [type, userId, date, routineId]);

  return {
    data: {
      workout,
      workoutGroups,
    },
    setData: {
      setWorkoutGroups,
      setWorkout,
    },
    isLoading: isInitialLoading,
    error,
    reload: loadLocalDetails,
  };
};
