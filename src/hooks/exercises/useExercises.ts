import useExericseFilters from "@/hooks/exercises/useExericseFilters";
import useSelectedExercises from "@/hooks/exercises/useSelectedExercises";
import {
  getAllLocalExercises,
  syncExercisesFromServerLocalFirst,
} from "@/services/exercise.service";

import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
} from "@/types/models";
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
    const all = await getAllLocalExercises();
    setExercises(all);
  }

  useEffect(() => {
    (async () => {
      if (!userId) return;

      const localAll = await getAllLocalExercises();
      if (localAll.length === 0) {
        await syncExercisesFromServerLocalFirst(userId);
      }
      loadLocalExerciseData();
    })();
  }, [userId]);

  const returnValue = {
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
