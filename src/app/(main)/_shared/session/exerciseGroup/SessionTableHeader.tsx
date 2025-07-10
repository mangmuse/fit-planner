import PrevSessionDetails from "@/app/(main)/_shared/session/pastSession/PrevSessionDetails";
import { useModal } from "@/providers/contexts/ModalContext";
import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
  Saved,
} from "@/types/models";
import Image from "next/image";
import deletIcon from "public/delete.svg";

type SessionTableHeaderProps = {
  prevDetails: LocalWorkoutDetail[];
  detail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>;

  isRoutine?: boolean;
};

const SessionTableHeader = ({
  prevDetails,
  detail,
}: SessionTableHeaderProps) => {
  const { openModal } = useModal();
  const handleDisplayPrevDetailsModal = () => {
    if (prevDetails.length === 0) return;
    openModal({
      type: "generic",
      children: <PrevSessionDetails prevDetails={prevDetails} />,
    });
  };

  return (
    <thead data-testid="session-table-header">
      <tr className="h-8 text-center text-text-muted">
        <th className="w-[14%] ">Set</th>
        <th
          onClick={handleDisplayPrevDetailsModal}
          className="w-[38%] underline underline-offset-2"
        >
          Previous
        </th>
        <th className="w-[17%]">{detail.weightUnit || "kg"}</th>
        <th className="w-[17%]">Reps</th>
        <th className="w-[14%]"></th>
      </tr>
    </thead>
  );
};

export default SessionTableHeader;
