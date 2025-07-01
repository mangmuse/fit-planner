import PrevSessionDetailItem from "@/app/(main)/_shared/session/pastSession/PrevSessionDetailItem";
import { LocalWorkoutDetail } from "@/types/models";

type PrevSessionDetailsProps = {
  prevDetails: LocalWorkoutDetail[];
};

const PrevSessionDetails = ({ prevDetails }: PrevSessionDetailsProps) => {
  if (prevDetails.length === 0) {
    return null;
  }
  return (
    <article>
      <h1>{prevDetails[0].exerciseName}</h1>

      <ul>
        {prevDetails.map((detail, idx) => (
          <PrevSessionDetailItem key={detail.id} detail={detail} index={idx} />
        ))}
      </ul>
    </article>
  );
};

export default PrevSessionDetails;
