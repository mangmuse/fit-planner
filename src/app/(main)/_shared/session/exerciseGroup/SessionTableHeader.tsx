import PrevSessionDetails from "@/app/(main)/_shared/session/pastSession/PrevSessionDetails";
import { useModal } from "@/providers/contexts/ModalContext";
import {
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkoutDetail,
} from "@/types/models";
import Image from "next/image";
import deletIcon from "public/delete.svg";

type SessionTableHeaderProps = {
  exercise: LocalExercise;
  prevDetails: LocalWorkoutDetail[];
  details: LocalWorkoutDetail[] | LocalRoutineDetail[];
  reload: () => Promise<void>;

  isRoutine?: boolean;
};

const SessionTableHeader = ({
  exercise,
  prevDetails,
  isRoutine = false,
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
        <th className="w-[17%]">{exercise.unit || "kg"}</th>
        <th className="w-[17%]">Reps</th>
        <th className="w-[14%]"></th>
      </tr>
    </thead>
  );
};

export default SessionTableHeader;
