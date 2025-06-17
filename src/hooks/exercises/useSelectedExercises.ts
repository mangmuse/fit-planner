import { isWorkoutDetails } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { useModal } from "@/providers/contexts/ModalContext";
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
  const { showError } = useModal();

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
    try {
      if (type === "RECORD" && userId && date) {
        await addLocalWorkoutDetailsByUserDate(userId, date, selectedExercises);
        router.replace(`/workout/${date}`);
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
        router.replace(`/routines/${routineId}`);
      }
    } catch (e) {
      showError("운동을 추가하는데 실패했습니다.");
    }
  };

  const handleReplaceExercise = async () => {
    try {
      if (!currentDetails || currentDetails.length === 0) return;
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
      showError("운동을 교체하는데 실패했습니다.");
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
