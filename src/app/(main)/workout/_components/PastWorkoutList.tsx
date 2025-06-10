import PastWorkoutItem from "@/app/(main)/workout/_components/PastWorkoutItem";
import { LocalWorkout } from "@/types/models";

type PastWorkoutListProps = {
  pastWorkouts: LocalWorkout[];
};

const PastWorkoutList = ({ pastWorkouts }: PastWorkoutListProps) => {
  if (pastWorkouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-text-muted text-sm">
          불러올 수 있는 운동 기록이 없습니다
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {pastWorkouts.map((workout) => (
        <PastWorkoutItem key={workout.id} workout={workout} />
      ))}
    </ul>
  );
};

export default PastWorkoutList;
