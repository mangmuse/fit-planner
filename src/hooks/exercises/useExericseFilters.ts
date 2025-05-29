import { getFilteredExercises } from "@/app/(main)/workout/[date]/exercises/_components/_utils/getFilteredExercises";
import { useDebounce } from "@/hooks/useDebounce";
import { Category, ExerciseType } from "@/types/filters";
import { LocalExercise } from "@/types/models";
import { useEffect, useState } from "react";

const useExericseFilters = ({ exercises }: { exercises: LocalExercise[] }) => {
  const [visibleExercises, setVisibleExercises] = useState<LocalExercise[]>([]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedKeyword = useDebounce(searchKeyword, 500);

  const [selectedExerciseType, setSelectedExerciseType] =
    useState<ExerciseType>("전체");
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");

  const handleSearchKeyword = (kw: string) => setSearchKeyword(kw);
  const handleChangeSelectedExerciseType = (t: ExerciseType) =>
    setSelectedExerciseType(t);
  const handleChangeSelectedCategory = (c: Category) => setSelectedCategory(c);

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
      visibleExercises,
      searchKeyword,
      selectedExerciseType,
      selectedCategory,
    },

    handlers: {
      handleSearchKeyword,
      handleChangeSelectedExerciseType,
      handleChangeSelectedCategory,
    },
  };
  return returnValue;
};

export default useExericseFilters;
