import PastWorkoutItem from "@/app/(main)/workout/_components/PastWorkoutItem";
import { LocalWorkout } from "@/types/models";

type PastWorkoutListProps = {
  pastWorkouts: LocalWorkout[];
};

const PastWorkoutList = ({ pastWorkouts }: PastWorkoutListProps) => {
  return (
    <ul className="flex flex-col gap-5">
      {pastWorkouts.map((workout) => (
        <PastWorkoutItem key={workout.id} workout={workout} />
      ))}
    </ul>
  );
};

export default PastWorkoutList;
