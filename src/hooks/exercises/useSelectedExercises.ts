import { isWorkoutDetails } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import {
  addLocalRoutineDetailsByWorkoutId,
  deleteRoutineDetails,
  getLocalRoutineDetails,
} from "@/services/routineDetail.service";
import {
  addLocalWorkoutDetailsByUserDate,
  addLocalWorkoutDetailsByWorkoutId,
  deleteWorkoutDetails,
} from "@/services/workoutDetail.service";
import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
} from "@/types/models";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UseSelectedExercises = {
  allowMultipleSelection?: boolean;
  currentDetails?: LocalWorkoutDetail[] | LocalRoutineDetail[];
  routineId?: number;
  type: "ROUTINE" | "RECORD";
  userId?: string;
  date?: string;

  reloadDetails?: () => Promise<void>;
};

const useSelectedExercises = ({
  allowMultipleSelection,
  reloadDetails,
  currentDetails,
  routineId,
  type,
  userId,
  date,
}: UseSelectedExercises) => {
  const router = useRouter();
  const { closeBottomSheet } = useBottomSheet();

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

  const handleAddDetail = async () => {
    if (type === "RECORD" && userId && date) {
      console.log("dqwjdqwpoj");
      await addLocalWorkoutDetailsByUserDate(userId, date, selectedExercises);
      router.push(`/workout/${date}`);
    } else {
      if (!routineId) return;

      // routineId로 맞는 detail찾아서 몇개인지 확인해서 startOrder 가져오기
      const details = await getLocalRoutineDetails(Number(routineId));
      const startOrder = details.length + 1;

      await addLocalRoutineDetailsByWorkoutId(
        Number(routineId),
        startOrder,
        selectedExercises
      );
      router.push(`/routines/${routineId}`);
    }
  };

  const handleReplaceExercise = async () => {
    console.log(reloadDetails);
    try {
      if (!currentDetails || currentDetails.length === 0) return;
      console.log("hello");
      if (isWorkoutDetails(currentDetails)) {
        const { exerciseOrder: startOrder, workoutId } = currentDetails[0];
        await addLocalWorkoutDetailsByWorkoutId(
          workoutId,
          startOrder,
          selectedExercises
        );

        await deleteWorkoutDetails(currentDetails);
      } else {
        const { exerciseOrder: startOrder, routineId } = currentDetails[0];
        await addLocalRoutineDetailsByWorkoutId(
          routineId,
          startOrder,
          selectedExercises
        );

        await deleteRoutineDetails(currentDetails);
      }
      await reloadDetails?.();
      closeBottomSheet();
    } catch (e) {
      console.log(e);
    }
  };

  return {
    selectedExercises,
    handleSelectExercise,
    handleUnselectExercise,
    handleAddDetail,
    handleReplaceExercise,
  };
};

export default useSelectedExercises;
