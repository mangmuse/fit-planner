import { LocalExercise } from "@/types/models";

import { useState } from "react";

type UseSelectedExercises = {
  allowMultipleSelection?: boolean;
};

const useSelectedExercises = ({
  allowMultipleSelection,
}: UseSelectedExercises) => {
  const [selectedExercises, setSelectedExercises] = useState<
    { id: number; name: string }[]
  >([]);

  const handleSelectExercise = (exercise: LocalExercise) => {
    if (!exercise.id || !exercise.name) return;

    if (!allowMultipleSelection) {
      setSelectedExercises([{ id: exercise.id, name: exercise.name }]);
      return;
    }

    setSelectedExercises((prev) => [
      ...prev,
      { id: exercise.id!, name: exercise.name },
    ]);
  };

  const handleUnselectExercise = (id: number) => {
    setSelectedExercises((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    selectedExercises,
    handleSelectExercise,
    handleUnselectExercise,
  };
};

export default useSelectedExercises;
