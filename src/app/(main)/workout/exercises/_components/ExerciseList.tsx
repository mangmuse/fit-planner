import ExerciseItem from "@/app/(main)/workout/exercises/_components/ExerciseItem";
import { Exercise } from "@prisma/client";

type ExerciseListProps = {
  exercises: Exercise[];
};
const ExerciseList = ({ exercises }: ExerciseListProps) => {
  return (
    <ul className="h-full flex flex-col gap-1 mt-[14px]">
      {exercises.map((exercise: Exercise) => (
        <ExerciseItem key={exercise.id} exercise={exercise} />
      ))}
    </ul>
  );
};

export default ExerciseList;
