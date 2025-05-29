import { getFilteredExercises } from "@/app/(main)/workout/[date]/exercises/_components/_utils/getFilteredExercises";
import { isWorkoutDetails } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { useDebounce } from "@/hooks/useDebounce";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import {
  getAllLocalExercises,
  syncExercisesFromServerLocalFirst,
} from "@/services/exercise.service";
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
import { Category, ExerciseType } from "@/types/filters";
import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
} from "@/types/models";
import { useRouter } from "next/navigation";
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
  const { closeBottomSheet } = useBottomSheet();
  const router = useRouter();

  const [exercises, setExercises] = useState<LocalExercise[]>([]);
  const [visibleExercises, setVisibleExercises] = useState<LocalExercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<
    { id: number; name: string }[]
  >([]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedKeyword = useDebounce(searchKeyword, 500);

  const [selectedExerciseType, setSelectedExerciseType] =
    useState<ExerciseType>("전체");
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");

  const handleSearchKeyword = (kw: string) => setSearchKeyword(kw);
  const handleChangeSelectedExerciseType = (t: ExerciseType) =>
    setSelectedExerciseType(t);
  const handleChangeSelectedCategory = (c: Category) => setSelectedCategory(c);

  const handleAddSelectedExercise = (exercise: LocalExercise) => {
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
  const handleDeleteSelectedExercise = (id: number) => {
    setSelectedExercises((prev) => prev.filter((item) => item.id !== id));
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

  const handleAddDetail = async () => {
    if (type === "RECORD" && userId && date) {
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

    // return () => reset();
  }, [userId]);

  useEffect(() => {
    const filtered = getFilteredExercises(
      exercises,
      debouncedKeyword,
      selectedExerciseType,
      selectedCategory
    );
    setVisibleExercises(filtered);
  }, [exercises, debouncedKeyword, selectedExerciseType, selectedCategory]);

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
      handleAddSelectedExercise,
      handleDeleteSelectedExercise,
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
  //   return {
  //     exercises,
  //     visibleExercises,
  //     selectedExercises,
  //     searchKeyword,
  //     selectedCategory,
  //     selectedExerciseType,

  //     handleSearchKeyword,
  //     handleChangeSelectedExerciseType,
  //     handleChangeSelectedCategory,
  //     handleAddSelectedExercise,
  //     handleDeleteSelectedExercise,
  //     handleReplaceExercise,
  //     handleAddDetail,

  //     reloadExercises: loadLocalExerciseData,
  //   };
};

export default useExercises;
