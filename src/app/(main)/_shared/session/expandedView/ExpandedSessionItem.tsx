import { LocalWorkoutDetail, Saved } from "@/types/models";

type ExpandedSessionItem = {
  workoutDetail: Saved<LocalWorkoutDetail>;
};
const ExpandedSessionItem = ({ workoutDetail }: ExpandedSessionItem) => {
  const { setOrder, reps, weight, weightUnit } = workoutDetail;
  return (
    <li className="flex items-center gap-3 text-sm text-text-muted">
      <span className="w-12">{setOrder}세트</span>
      <span className="font-medium text-white">
        {weight}
        {weightUnit} × {reps}회
      </span>
    </li>
  );
};

export default ExpandedSessionItem;
