import useExericseFilters from "@/hooks/exercises/useExericseFilters";
import useSelectedExercises from "@/hooks/exercises/useSelectedExercises";
import { exerciseService } from "@/services/exercise.service";

import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
} from "@/types/models";
import { testError } from "@/util/testError";
import { useEffect, useState } from "react";

type UseExercisesProps = {
  type: "ROUTINE" | "RECORD";

  allowMultipleSelection?: boolean;
  userId?: string;
  date?: string;
  routineId?: number;
  reloadDetails?: () => Promise<void>;
  currentDetails?: LocalWorkoutDetail[] | LocalRoutineDetail[];
};

const useExercises = ({
  type,
  routineId,
  date,
  reloadDetails,
  currentDetails,
  allowMultipleSelection,
  userId,
}: UseExercisesProps) => {
  const [exercises, setExercises] = useState<LocalExercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  const { data, handlers } = useExericseFilters({ exercises });
  const {
    visibleExercises,
    searchKeyword,
    selectedCategory,
    selectedExerciseType,
  } = data;
  const {
    handleSearchKeyword,
    handleChangeSelectedExerciseType,
    handleChangeSelectedCategory,
  } = handlers;

  const {
    selectedExercises,
    handleAddDetail,
    handleSelectExercise,
    handleReplaceExercise,
    handleUnselectExercise,
  } = useSelectedExercises({
    allowMultipleSelection,
    reloadDetails,
    type,
    currentDetails,
    date,
    userId,
    routineId,
  });

  async function loadLocalExerciseData() {
    try {
      setError(null);
      setLoading(true);

      const all = await exerciseService.getAllLocalExercises();
      setExercises(all);
    } catch (e) {
      setError("운동 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        if (!userId) return;

        const localAll = await exerciseService.getAllLocalExercises();
        if (localAll.length === 0) {
          await exerciseService.syncExercisesFromServerLocalFirst(userId);
        }
        await loadLocalExerciseData();
      } catch (e) {
        console.error("[useExercises] Error", e);
        setError("운동목록 초기화에 실패했습니다.");
      }
    })();
  }, [userId]);

  const returnValue = {
    error,
    isLoading,
    data: {
      exercises,
      visibleExercises,
      selectedExercises,
    },
    handlers: {
      handleSearchKeyword,
      handleChangeSelectedExerciseType,
      handleChangeSelectedCategory,
      handleSelectExercise,
      handleUnselectExercise,
      handleReplaceExercise,
      handleAddDetail,
      reloadExercises: loadLocalExerciseData,
    },
    filters: {
      searchKeyword,
      selectedCategory,
      selectedExerciseType,
    },
  };
  return returnValue;
};

export default useExercises;
