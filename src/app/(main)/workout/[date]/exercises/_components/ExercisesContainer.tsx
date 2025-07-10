"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import addButton from "public/add.svg";
import { LocalRoutineDetail, LocalWorkoutDetail, Saved } from "@/types/models";
import ExerciseFilter from "@/app/(main)/workout/[date]/exercises/_components/ExerciseFilter";
import SearchBar from "@/app/(main)/workout/[date]/exercises/_components/SearchBar";
import ExerciseList from "@/app/(main)/workout/[date]/exercises/_components/ExerciseList";

import useExercises from "@/hooks/exercises/useExercises";
import { useModal } from "@/providers/contexts/ModalContext";
import CustomExerciseForm from "@/app/(main)/workout/[date]/exercises/_components/CustomExerciseForm";
import ErrorState from "@/components/ErrorState";
import useSelectedExercises from "@/hooks/exercises/useSelectedExercises";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { routineDetailService, workoutDetailService } from "@/lib/di";
import { isWorkoutDetails } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import useExerciseFilters from "@/hooks/exercises/useExerciseFilters";
import { useWeightUnitPreference } from "@/hooks/useWeightUnitPreference";

type ExercisesContainerProps = {
  type: "ROUTINE" | "RECORD";
  routineId?: number;
  allowMultipleSelection?: boolean;
  currentDetails?: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[];
  reloadDetails?: () => Promise<void>;
};

export default function ExercisesContainer({
  type,
  allowMultipleSelection = true,
  currentDetails,
  reloadDetails,
}: ExercisesContainerProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [weightUnit] = useWeightUnitPreference();

  const { openModal, showError } = useModal();
  const router = useRouter();
  const { closeBottomSheet } = useBottomSheet();
  const { date } = useParams<{ date?: string }>();
  const { routineId: stringRoutineId } = useParams<{ routineId?: string }>();
  const routineId = stringRoutineId ? Number(stringRoutineId) : undefined;

  const { error, isLoading, exercises, reloadExercises } = useExercises({
    userId,
  });

  const {
    data: {
      visibleExercises,
      searchKeyword,
      selectedCategory,
      selectedExerciseType,
    },
    handlers: {
      handleSearchKeyword,
      handleChangeSelectedExerciseType,
      handleChangeSelectedCategory,
    },
  } = useExerciseFilters({ exercises });

  const { handleSelectExercise, handleUnselectExercise, selectedExercises } =
    useSelectedExercises({ allowMultipleSelection });

  const handleAddDetail = async () => {
    try {
      if (type === "RECORD" && userId && date) {
        await workoutDetailService.addLocalWorkoutDetailsByUserDate(
          userId,
          date,
          selectedExercises,
          weightUnit
        );
        router.replace(`/workout/${date}`);
      } else {
        if (!routineId) return;

        // routineId로 맞는 detail찾아서 몇개인지 확인해서 startOrder 가져오기
        const details = await routineDetailService.getLocalRoutineDetails(
          Number(routineId)
        );
        const startOrder = details.length + 1;

        await routineDetailService.addLocalRoutineDetailsByWorkoutId(
          Number(routineId),
          startOrder,
          selectedExercises,
          weightUnit
        );
        router.replace(`/routines/${routineId}`);
      }
    } catch (e) {
      console.error("[ExercisesContainer] Error", e);
      showError("운동을 추가하는데 실패했습니다.");
    }
  };

  const handleReplaceExercise = async () => {
    try {
      if (!currentDetails || currentDetails.length === 0) return;
      if (isWorkoutDetails(currentDetails)) {
        const { exerciseOrder: startOrder, workoutId } = currentDetails[0];
        await workoutDetailService.addLocalWorkoutDetailsByWorkoutId(
          workoutId,
          startOrder,
          selectedExercises,
          weightUnit
        );

        await workoutDetailService.deleteWorkoutDetails(currentDetails);
      } else {
        const { exerciseOrder: startOrder, routineId } = currentDetails[0];
        await routineDetailService.addLocalRoutineDetailsByWorkoutId(
          routineId,
          startOrder,
          selectedExercises,
          weightUnit
        );

        await routineDetailService.deleteRoutineDetails(currentDetails);
      }
      await reloadDetails?.();
      closeBottomSheet();
    } catch (e) {
      console.error("[ExercisesContainer] Error", e);
      showError("운동을 교체하는데 실패했습니다.");
    }
  };

  const handleOpenCreateExerciseModal = () =>
    openModal({
      type: "generic",
      children: <CustomExerciseForm reload={reloadExercises} />,
    });

  const buttonLabel = allowMultipleSelection
    ? `${selectedExercises.length}개 선택 완료`
    : "교체하기";

  if (error) return <ErrorState error={error} onRetry={reloadExercises} />;

  return (
    <main className="pb-20">
      <div
        onClick={handleOpenCreateExerciseModal}
        className="flex justify-end mt-4 mb-3"
      >
        <Image src={addButton} alt="추가하기" />
      </div>
      <SearchBar onChange={handleSearchKeyword} keyword={searchKeyword} />
      <ExerciseFilter
        handleChangeSelectedExerciseType={handleChangeSelectedExerciseType}
        handleChangeSelectedCategory={handleChangeSelectedCategory}
        selectedExerciseType={selectedExerciseType}
        selectedCategory={selectedCategory}
      />

      {userId && visibleExercises.length > 0 && (
        <ExerciseList
          exercises={visibleExercises}
          selectedExercises={selectedExercises}
          onAdd={handleSelectExercise}
          onDelete={handleUnselectExercise}
          onReload={reloadExercises}
        />
      )}

      {selectedExercises.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] p-4 bg-bg-primary border-t border-border-gray">
          <button
            onClick={
              allowMultipleSelection ? handleAddDetail : handleReplaceExercise
            }
            className="w-full py-3 px-4 rounded-xl bg-primary text-bg-base font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200"
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </main>
  );
}
