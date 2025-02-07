import ExerciseItem from "@/app/(main)/workout/[date]/exercises/_components/ExerciseItem";
import { ExerciseQueryParams } from "@/types/dto/exercise.dto";
import { ClientExercise, ClientUser, LocalExercise } from "@/types/models";

type ExerciseListProps = {
  exercises: LocalExercise[];
  selectedExercises: LocalExercise["id"][];
  onAdd: (newId: LocalExercise["id"]) => void;
  onDelete: (toBeDeleted: ClientExercise["id"]) => void;
  onReload: () => void;
  queryOptions: ExerciseQueryParams;
  userId: ClientUser["id"];
};
const ExerciseList = ({
  exercises,
  onAdd,
  onDelete,
  onReload,
  selectedExercises,
  queryOptions,
  userId,
}: ExerciseListProps) => {
  console.log(exercises);
  return (
    <ul className="h-full flex flex-col gap-1 mt-[14px]">
      {exercises.map((exercise: LocalExercise) => (
        <ExerciseItem
          key={exercise.id}
          queryOptions={queryOptions}
          isSelected={selectedExercises.includes(exercise.id)}
          onAdd={onAdd}
          onDelete={onDelete}
          exercise={exercise}
          userId={userId}
          onReload={onReload}
        />
      ))}
    </ul>
  );
};

export default ExerciseList;
