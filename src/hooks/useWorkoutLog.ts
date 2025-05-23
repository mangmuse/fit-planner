// app/_hooks/useWorkoutLog.ts
"use client";

import { useCallback, useEffect, useState } from "react";

import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import { LocalWorkoutDetail } from "@/types/models";
import { getLocalWorkoutDetails } from "@/services/workoutDetail.service";
import {
  getWorkoutByUserIdAndDate,
  updateLocalWorkout,
} from "@/services/workout.service";

export function useWorkoutLog(userId: string | undefined, date: string) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<
    { exerciseOrder: number; details: LocalWorkoutDetail[] }[]
  >([]);

  /* ① 디테일 로드 */
  const reload = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const details = await getLocalWorkoutDetails(userId, date);
    setGroups(getGroupedDetails(details));
    setLoading(false);
  }, [userId, date]);

  /* ② 워크아웃 status 동기화 */
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const workout = await getWorkoutByUserIdAndDate(userId, date);
      if (!workout?.id || workout.status === "COMPLETED") return;
      const status = groups.length === 0 ? "EMPTY" : "PLANNED";
      if (workout.status !== status)
        await updateLocalWorkout({ ...workout, status });
    })();
  }, [userId, date, groups]);

  /* 첫 로드 */
  useEffect(() => {
    reload();
  }, [reload]);

  return { loading, groups, reload };
}
