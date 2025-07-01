import { LocalWorkoutDetail } from "@/types/models";

type PrevSessionDetailItemProps = {
  detail: LocalWorkoutDetail;
  index: number;
};

const PrevSessionDetailItem = ({
  detail,
  index,
}: PrevSessionDetailItemProps) => {
  return (
    <li className="flex flex-col gap-1 max-w-48">
      <div className="flex gap-1">
        <span>{index + 1}.</span>
        <span>
          {detail.weight} x {detail.reps}
        </span>
        {typeof detail.rpe === "number" && detail.rpe >= 1 && (
          <span>RPE {detail.rpe}</span>
        )}
      </div>
    </li>
  );
};

export default PrevSessionDetailItem;
