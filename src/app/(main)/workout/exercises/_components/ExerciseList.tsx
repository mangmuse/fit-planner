import ExerciseItem from "@/app/(main)/workout/exercises/_components/ExerciseItem";
import { useModal } from "@/providers/contexts/ModalContext";
import { ExerciseQueryParams } from "@/types/dto/exercise.dto";
import { ClientExerise } from "@/types/models";

type ExerciseListProps = {
  exercises: ClientExerise[];
  selectedExercises: ClientExerise["id"][];
  onAdd: (newId: ClientExerise["id"]) => void;
  onDelete: (toBeDeleted: ClientExerise["id"]) => void;
  queryOptions: ExerciseQueryParams;
};
const ExerciseList = ({
  exercises,
  onAdd,
  onDelete,
  selectedExercises,
  queryOptions,
}: ExerciseListProps) => {
  return (
    <ul className="h-full flex flex-col gap-1 mt-[14px]">
      {exercises.map((exercise: ClientExerise) => (
        <ExerciseItem
          key={exercise.id}
          queryOptions={queryOptions}
          isSelected={selectedExercises.includes(exercise.id)}
          onAdd={onAdd}
          onDelete={onDelete}
          exercise={exercise}
        />
      ))}
    </ul>
  );
};

export default ExerciseList;
