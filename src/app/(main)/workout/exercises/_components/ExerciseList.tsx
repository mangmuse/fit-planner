import ExerciseItem from "@/app/(main)/workout/exercises/_components/ExerciseItem";
import { ClientExerise } from "@/types/models";

type ExerciseListProps = {
  exercises: ClientExerise[];
};
const ExerciseList = ({ exercises }: ExerciseListProps) => {
  return (
    <ul className="h-full flex flex-col gap-1 mt-[14px]">
      {exercises.map((exercise: ClientExerise) => (
        <ExerciseItem key={exercise.id} exercise={exercise} />
      ))}
    </ul>
  );
};

export default ExerciseList;
