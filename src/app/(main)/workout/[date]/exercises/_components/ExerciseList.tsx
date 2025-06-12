import ExerciseItem from "@/app/(main)/workout/[date]/exercises/_components/ExerciseItem";
import { ExerciseQueryParams } from "@/types/dto/exercise.dto";
import { ClientExercise, ClientUser, LocalExercise } from "@/types/models";

type ExerciseListProps = {
  exercises: LocalExercise[];
  selectedExercises: { id: number; name: string }[];
  onAdd: (newExercise: LocalExercise) => void;
  onDelete: (toBeDeleted: ClientExercise["id"]) => void;
  onReload: () => void;
};
const ExerciseList = ({
  exercises,
  onAdd,
  onDelete,
  onReload,
  selectedExercises,
}: ExerciseListProps) => {
  return (
    <ul className="flex flex-col gap-2 mt-4">
      {exercises.map((exercise: LocalExercise) => (
        <ExerciseItem
          key={exercise.id}
          isSelected={selectedExercises.some(
            (selected) => selected.id === exercise.id
          )}
          onAdd={onAdd}
          onDelete={onDelete}
          exercise={exercise}
          onReload={onReload}
        />
      ))}
    </ul>
  );
};

export default ExerciseList;
