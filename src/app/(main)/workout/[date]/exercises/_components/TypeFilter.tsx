import { EXERCISETYPELIST } from "@/constants/filters";
import FilterButton from "./FilterButton";
import { ExerciseType } from "@/types/filters";
export type TypeFilterProps = {
  selectedExerciseType: ExerciseType;
  onClick: (exerciseType: ExerciseType) => void;
};

const TypeFilter = ({ selectedExerciseType, onClick }: TypeFilterProps) => {
  return (
    <nav className="flex mb-1 gap-1.5" role="tablist">
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
