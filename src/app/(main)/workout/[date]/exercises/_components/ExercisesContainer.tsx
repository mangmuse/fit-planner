"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import addButton from "public/add.svg";
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import ExerciseFilter from "@/app/(main)/workout/[date]/exercises/_components/ExerciseFilter";
import SearchBar from "@/app/(main)/workout/[date]/exercises/_components/SearchBar";
import ExerciseList from "@/app/(main)/workout/[date]/exercises/_components/ExerciseList";

import useExercises from "@/hooks/exercises/useExercises";

type ExercisesContainerProps = {
  type: "ROUTINE" | "RECORD";
  routineId?: number;
  allowMultipleSelection?: boolean;
  currentDetails?: LocalWorkoutDetail[] | LocalRoutineDetail[];
  reloadDetails?: () => Promise<void>;
};

export default function ExercisesContainer({
  type,
  allowMultipleSelection,
  currentDetails,
  reloadDetails,
}: ExercisesContainerProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { date } = useParams<{ date?: string }>();
  const { routineId: stringRoutineId } = useParams();
  const routineId = stringRoutineId ? Number(stringRoutineId) : undefined;

  const { data, filters, handlers } = useExercises({
    type,
    allowMultipleSelection,
    userId,
    reloadDetails,
    currentDetails,
    date,
    routineId,
  });

  const { exercises, selectedExercises, visibleExercises } = data;
  const { searchKeyword, selectedCategory, selectedExerciseType } = filters;
  const {
    handleAddDetail,
    handleSelectExercise,
    handleUnselectExercise,
    handleChangeSelectedCategory,
    handleChangeSelectedExerciseType,
    handleReplaceExercise,
    handleSearchKeyword,
    reloadExercises,
  } = handlers;

  const buttonLabel = allowMultipleSelection
    ? `${selectedExercises.length}개 선택 완료`
    : "교체하기";

  return (
    <main className="pb-20">
      <div className="flex justify-end mt-4 mb-3">
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
