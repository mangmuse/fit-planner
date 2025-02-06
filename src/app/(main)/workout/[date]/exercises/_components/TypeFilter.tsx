import { EXERCISETYPELIST } from "@/constants/filters";
import FilterButton from "./FilterButton";
import { ExerciseType } from "@/types/filters";

type TypeFilter = {
  selectedExerciseType: ExerciseType;
  onClick: (exerciseType: ExerciseType) => void;
};

const TypeFilter = ({ selectedExerciseType, onClick }: TypeFilter) => {
  return (
    <nav className="flex mb-1 gap-1">
      {EXERCISETYPELIST.map((ex, idx) => (
        <FilterButton<ExerciseType>
          key={idx}
          onClick={onClick}
          isSelected={selectedExerciseType === ex}
          label={ex}
        />
      ))}
    </nav>
  );
};

export default TypeFilter;
