import ExerciseItem from "@/app/(main)/workout/exercises/_components/ExerciseItem";
import { ExerciseQueryParams } from "@/types/dto/exercise.dto";
import { ClientExerise, ClientUser } from "@/types/models";

type ExerciseListProps = {
  exercises: ClientExerise[];
  selectedExercises: ClientExerise["id"][];
  onAdd: (newId: ClientExerise["id"]) => void;
  onDelete: (toBeDeleted: ClientExerise["id"]) => void;
  queryOptions: ExerciseQueryParams;
  userId: ClientUser["id"];
};
const ExerciseList = ({
  exercises,
  onAdd,
  onDelete,
  selectedExercises,
  queryOptions,
  userId,
}: ExerciseListProps) => {
  console.log(exercises);
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
          userId={userId}
        />
      ))}
    </ul>
  );
};

export default ExerciseList;
