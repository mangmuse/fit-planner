import { EXERCISETYPELIST } from "@/constants/filters";
import FilterButton from "./FilterButton";
import { ExerciseType } from "@/types/filters";
// TODO: CategoryFilter 와의 통합 필요성
type TypeFilter = {
  selectedExerciseType: ExerciseType;
  onClick: (exerciseType: ExerciseType) => void;
};

const TypeFilter = ({ selectedExerciseType, onClick }: TypeFilter) => {
  return (
    <nav data-testid="type-filter" className="flex mb-1 gap-1.5">
      {EXERCISETYPELIST.map((ex, idx) => (
        <FilterButton<ExerciseType>
          key={`type-${idx}`}
          onClick={onClick}
          isSelected={selectedExerciseType === ex}
          label={ex}
        />
      ))}
    </nav>
  );
};

export default TypeFilter;
