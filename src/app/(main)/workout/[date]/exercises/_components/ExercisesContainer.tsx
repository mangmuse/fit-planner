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
  // const {
  //   exercises,
  //   selectedCategory,
  //   selectedExerciseType,
  //   handleAddDetail,
  //   handleAddSelectedExercise,
  //   handleChangeSelectedCategory,
  //   handleChangeSelectedExerciseType,
  //   handleDeleteSelectedExercise,
  //   handleReplaceExercise,
  //   handleSearchKeyword,
  //   reloadExercises,
  //   searchKeyword,
  //   selectedExercises,
  //   visibleExercises,
  // } =

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

  // const router = useRouter();
  // const { reload } = useLoadDetails({
  //   type,
  //   userId: userId ?? "",
  //   date,
  //   routineId: routineId ? Number(routineId) : undefined,
  // });

  const buttonLabel = allowMultipleSelection
    ? `${selectedExercises.length}개 선택 완료`
    : "교체하기";

  return (
    <main>
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
        <button
          onClick={
            allowMultipleSelection ? handleAddDetail : handleReplaceExercise
          }
          className="fixed left-1/2 -translate-x-1/2 bottom-8 w-[330px] h-[47px] bg-primary text-text-black font-bold rounded-2xl shadow-xl"
        >
          {buttonLabel}
        </button>
      )}
    </main>
  );
}
