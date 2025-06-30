import { LocalWorkoutDetail } from "@/types/models";

type ExpandedSessionItem = {
  exerciseUnit: "kg" | "lbs";
  workoutDetail: LocalWorkoutDetail;
};
const ExpandedSessionItem = ({
  workoutDetail,
  exerciseUnit,
}: ExpandedSessionItem) => {
  const { setOrder, reps, weight } = workoutDetail;
  return (
    <li className="flex items-center gap-3 text-sm text-text-muted">
      <span className="w-12">{setOrder}세트</span>
      <span className="font-medium text-white">
        {weight}{exerciseUnit} × {reps}회
      </span>
    </li>
  );
};

export default ExpandedSessionItem;
