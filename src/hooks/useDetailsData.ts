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
import { useCallback, useEffect, useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";

type LiveQueryResult<T> = {
  data: T;
  error: Error | null;
};

export const useDetailsData = (
  type: SessionDetailType,
  userId: string,
  date?: string,
  routineId?: number
) => {
  const [workout, setWorkout] = useState<Saved<LocalWorkout> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const loadWorkout = useCallback(async () => {
    if (type !== "RECORD" || !userId || !date) return null;

    try {
      let currentWorkout = await workoutService.getWorkoutByUserIdAndDate(
        userId,
        date
      );
      if (!currentWorkout) {
        await workoutService.addLocalWorkout(userId, date);
        currentWorkout = await workoutService.getWorkoutByUserIdAndDate(
          userId,
          date
        );
      }
      setWorkout(currentWorkout || null);
      return currentWorkout;
    } catch (e) {
      console.error("[useDetailsData] Error:", e);
      setError("운동 정보를 불러오는데 실패했습니다");
      return null;
    }
  }, [type, userId, date]);

  const workoutDetails = useLiveQuery<
    LiveQueryResult<Saved<LocalWorkoutDetail>[]>
  >(async () => {
    if (type !== "RECORD" || !workout?.id) return { data: [], error: null };

    try {
      const details =
        await workoutDetailService.getLocalWorkoutDetailsByWorkoutId(
          workout.id
        );

      return { data: details, error: null };
    } catch (e) {
      console.error("[useDetailsData] Error:", e);
      return { data: [], error: e };
    }
  }, [type, workout?.id, refreshKey]);

  const routineDetails = useLiveQuery<
    LiveQueryResult<Saved<LocalRoutineDetail>[]>
  >(async () => {
    if (type !== "ROUTINE" || !routineId) return { data: [], error: null };

    try {
      const details =
        await routineDetailService.getLocalRoutineDetails(routineId);
      return { data: details, error: null };
    } catch (e) {
      console.error("[useDetailsData] Error:", e);
      return { data: [], error: e };
    }
  }, [type, routineId, refreshKey]);

  const workoutGroups = useMemo<SessionGroup[]>(() => {
    if (type === "RECORD") {
      if (workoutDetails?.error) {
        return [];
      }
      if (!workoutDetails?.data || workoutDetails.data.length === 0) return [];
      return getGroupedDetails(workoutDetails.data);
    } else if (type === "ROUTINE") {
      if (routineDetails?.error) {
        return [];
      }
      if (!routineDetails?.data || routineDetails.data.length === 0) return [];
      return getGroupedDetails(routineDetails.data);
    }
    return [];
  }, [type, workoutDetails, routineDetails]);

  useEffect(() => {
    if (workoutDetails?.error) {
      setError("운동 정보를 불러오는데 실패했습니다");
    } else if (routineDetails?.error) {
      setError("루틴 정보를 불러오는데 실패했습니다");
    }
  }, [workoutDetails?.error, routineDetails?.error]);

  useEffect(() => {
    if (type === "RECORD" && userId && date) {
      (async () => {
        setIsInitialLoading(true);
        await loadWorkout();
        setIsInitialLoading(false);
      })();
    } else if (type === "ROUTINE") {
      setIsInitialLoading(false);
    }
  }, [type, userId, date, loadWorkout]);

  const reload = useCallback(async () => {
    setError(null);

    if (type === "RECORD" && userId && date) {
      setIsInitialLoading(true);
      await loadWorkout();
      setIsInitialLoading(false);
    }

    setRefreshKey((prev) => prev + 1);
  }, [type, userId, date, loadWorkout]);

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
    if (type === "RECORD" && date && !isInitialLoading) {
      syncWorkoutStatus();
    }
  }, [workoutGroups, type, date, isInitialLoading]);

  return {
    data: {
      workout,
      workoutGroups,
    },
    setData: {
      setWorkout,
    },
    isLoading: isInitialLoading,
    error,
    reload,
  };
};
