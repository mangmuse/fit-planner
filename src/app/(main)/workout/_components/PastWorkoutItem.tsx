import { LocalWorkout } from "@/types/models";

type PastWorkoutItemProps = {
  workout: LocalWorkout;
};

const PastWorkoutItem = ({ workout }: PastWorkoutItemProps) => {
  return (
    <li key={workout.id} className="flex bg-bg-surface h-20 flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{workout.date}</span>
      </div>
    </li>
  );
};

export default PastWorkoutItem;
