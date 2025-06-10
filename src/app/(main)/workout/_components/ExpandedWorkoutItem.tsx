import { LocalWorkoutDetail } from "@/types/models";

type ExpandedWorkoutItem = {
  exerciseUnit: "kg" | "lbs";
  workoutDetail: LocalWorkoutDetail;
};
const ExpandedWorkoutItem = ({
  workoutDetail,
  exerciseUnit,
}: ExpandedWorkoutItem) => {
  const { setOrder, reps, weight } = workoutDetail;
  return (
    <li className="flex gap-1">
      <span>{setOrder}세트</span>
      <span>
        {weight}
        {exerciseUnit}
      </span>
      <span>{reps}회</span>
    </li>
  );
};

export default ExpandedWorkoutItem;
