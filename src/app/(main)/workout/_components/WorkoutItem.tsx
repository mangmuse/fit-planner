import { ClientWorkoutDetail } from "@/types/models";

type WorkoutItemProps = {
  workoutDetail: ClientWorkoutDetail;
};

const WorkoutItem = ({ workoutDetail }: WorkoutItemProps) => {
  const { exerciseName, isDone, setOrder, weight } = workoutDetail;
  return <li></li>;
};

export default WorkoutItem;
