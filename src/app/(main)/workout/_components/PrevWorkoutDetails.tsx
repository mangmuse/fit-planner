import { LocalWorkoutDetail } from "@/types/models";

type PrevWorkoutDetailsProps = {
  prevDetails: LocalWorkoutDetail[];
};

const PrevWorkoutDetails = ({ prevDetails }: PrevWorkoutDetailsProps) => {
  if (!prevDetails || prevDetails.length === 0) {
    return <p>prevDetails가 전달되지 않았습니다</p>;
  }
  return (
    <article>
      <h1>{prevDetails[0].exerciseName}</h1>

      <ul>
        {prevDetails.map((detail, idx) => (
          <li className="flex flex-col gap-1 max-w-48" key={idx}>
            <div className="flex gap-1 ">
              <span>{idx + 1}.</span>
              <span>
                {detail.weight} x {detail.reps}
              </span>
              {typeof detail.rpe === "number" && detail.rpe >= 1 && (
                <span>RPE {detail.rpe}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};

export default PrevWorkoutDetails;
