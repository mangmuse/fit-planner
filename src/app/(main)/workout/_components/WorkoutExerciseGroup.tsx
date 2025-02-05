import WorkoutItem from "@/app/(main)/workout/_components/WorkoutItem";
import { ClientWorkoutDetail } from "@/types/models";

type WorkoutExerciseGroupProps = {
  exerciseOrder: number;
  details: ClientWorkoutDetail[];
};

const WorkoutExerciseGroup = ({
  details,
  exerciseOrder,
}: WorkoutExerciseGroupProps) => {
  return (
    <div>
      <span>{exerciseOrder}</span>
      <span>{details[0].exerciseName}</span>
      {details.map((detail) => (
        <WorkoutItem key={detail.id} workoutDetail={detail} />
      ))}
    </div>
  );
};

export default WorkoutExerciseGroup;
