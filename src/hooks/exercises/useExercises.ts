import { exerciseService } from "@/lib/di";

import { LocalExercise } from "@/types/models";
import { useEffect, useState } from "react";

type UseExercisesProps = {
  userId?: string;
};

const useExercises = ({ userId }: UseExercisesProps) => {
  const [exercises, setExercises] = useState<LocalExercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  async function loadLocalExerciseData() {
    try {
      setError(null);
      setLoading(true);

      if (!userId) return;

      const all = await exerciseService.getAllLocalExercises(userId);
      setExercises(all);
    } catch (e) {
      console.error("[useExercises] Error", e);
      setError("운동 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const loadExercises = async () => {
    try {
      if (!userId) return;

      setError(null);
      setLoading(true);
      await exerciseService.syncFromServerIfNeeded(userId);
      const syncedData = await exerciseService.getAllLocalExercises(userId);

      setExercises(syncedData);
    } catch (e) {
      console.error("[useExercises] Error", e);
      setError("운동목록 초기화에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [userId]);

  const returnValue = {
    error,
    isLoading,
    exercises,
    reloadExercises: loadLocalExerciseData,
  };
  return returnValue;
};

export default useExercises;
