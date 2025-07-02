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
        <span data-testid="set-order">{index + 1}.</span>
        <span data-testid="weight-reps">
          {detail.weight} x {detail.reps}
        </span>
        {typeof detail.rpe === "number" && detail.rpe >= 1 && (
          <span data-testid="rpe">RPE {detail.rpe}</span>
        )}
      </div>
    </li>
  );
};

export default PrevSessionDetailItem;
