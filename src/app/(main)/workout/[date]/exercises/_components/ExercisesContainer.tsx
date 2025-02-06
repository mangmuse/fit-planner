"use client";

import Image from "next/image";
import addButton from "public/add.svg";
import { Category, ExerciseType } from "@/types/filters";
import { useEffect, useState } from "react";
import ExerciseList from "@/app/(main)/workout/[date]/exercises/_components/ExerciseList";
import ExerciseFilter from "@/app/(main)/workout/[date]/exercises/_components/ExerciseFilter";
import SearchBar from "@/app/(main)/workout/[date]/exercises/_components/SearchBar";
import { useExercisesQuery } from "@/hooks/api/query/useExercisesQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { ClientExerise } from "@/types/models";
import { useSession } from "next-auth/react";
import { PostWorkoutDetailsInput } from "@/types/dto/workoutDetail.dto";
import useWorkoutMutation from "@/hooks/api/mutation/useWorkoutMutation";
import { getFormattedDateYMD } from "@/util/formatDate";
import { useParams, useRouter } from "next/navigation";
import { getFilteredExercises } from "@/app/(main)/workout/[date]/exercises/_components/_utils/getFilteredExercises";
/**
 1. 쿼리로 날짜와 userId가 맞는 workout 가져오기
 */
function ExercisesContainer({ exercises }: { exercises: ClientExerise[] }) {
  const router = useRouter();

  const { data: session } = useSession();
  const { date } = useParams();
  const userId = session?.user?.id;
  const [visibleExercises, setVisibleExercises] = useState<ClientExerise[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedExerciseType, setSelectedExerciseType] =
    useState<ExerciseType>("전체");

  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");
  const debouncedKeyword = useDebounce(searchKeyword, 1000);

  const [selectedExercises, setSelectedExercises] = useState<
    ClientExerise["id"][]
  >([]);
  const handleAddSelectedExercise = (newId: ClientExerise["id"]) =>
    setSelectedExercises((prev) => [...prev, newId]);

  const handleDeleteSelectedExercise = (toBeDeleted: ClientExerise["id"]) =>
    setSelectedExercises((prev) => prev.filter((item) => item !== toBeDeleted));

  const queryOptions = {
    userId,
    keyword: debouncedKeyword,
    exerciseType: selectedExerciseType,
    category: selectedCategory,
  };
  // const { data } = useExercisesQuery({
  //   ...queryOptions,
  // });

  const { addWorkoutDetails } = useWorkoutMutation(
    userId,
    date as string | undefined
  );

  const handleSearchKeyword = (keyword: string) => setSearchKeyword(keyword);

  const handleChangeSelectedExerciseType = (exerciseType: ExerciseType) =>
    setSelectedExerciseType(exerciseType);

  const handleChangeSelectedCategory = (category: Category) =>
    setSelectedCategory(category);

  const handleAddWorkoutDetail = async () => {
    const today = new Date();
    const date = getFormattedDateYMD(today);

    const postWorkoutDetailInput: PostWorkoutDetailsInput = {
      selectedExercises,
      userId,
      date,
    };
    await addWorkoutDetails(postWorkoutDetailInput, {
      onSuccess: () => router.push(`/workout/${date}`),
    });
  };

  useEffect(() => {
    const filteredExercises = getFilteredExercises(
      exercises,
      searchKeyword,
      selectedExerciseType,
      selectedCategory
    );
    setVisibleExercises(filteredExercises);
  }, [exercises, searchKeyword, selectedExerciseType, selectedCategory]);

  return (
    <main className="">
      <div className="flex justify-end mt-[53px] mb-3">
        <Image src={addButton} alt="추가하기" />
      </div>
      <SearchBar onChange={handleSearchKeyword} keyword={searchKeyword} />
      <ExerciseFilter
        handleChangeSelectedExerciseType={handleChangeSelectedExerciseType}
        handleChangeSelectedCategory={handleChangeSelectedCategory}
        selectedExerciseType={selectedExerciseType}
        selectedCategory={selectedCategory}
      />
      {userId && (
        <ExerciseList
          userId={userId}
          selectedExercises={selectedExercises}
          queryOptions={queryOptions}
          onAdd={handleAddSelectedExercise}
          onDelete={handleDeleteSelectedExercise}
          exercises={visibleExercises}
        />
      )}

      {selectedExercises.length > 0 && (
        <button
          onClick={handleAddWorkoutDetail}
          className="fixed left-1/2 -translate-x-1/2 bottom-8 shadow-xl w-[330px] h-[47px] font-bold rounded-2xl bg-primary text-text-black"
        >
          {selectedExercises.length}개 선택 완료
        </button>
      )}
    </main>
  );
}

export default ExercisesContainer;
