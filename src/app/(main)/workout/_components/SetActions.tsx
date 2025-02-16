"use client";

import { addSet, deleteSet } from "@/services/workoutDetail.service";
import { LocalWorkoutDetail } from "@/types/models";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

type SetActionsProps = {
  lastValue: LocalWorkoutDetail;
  loadLocalWorkoutDetails: () => Promise<void>;
};

const SetActions = ({
  lastValue,
  loadLocalWorkoutDetails,
}: SetActionsProps) => {
  const userId = useSession()?.data?.user?.id;
  const { date } = useParams();

  const handleAddSet = async () => {
    await addSet(lastValue);
    loadLocalWorkoutDetails();
  };
  const handleDeleteSet = async () => {
    await deleteSet(lastValue.id ?? 0);
    loadLocalWorkoutDetails();
  };
  return (
    <div className="flex justify-center gap-2.5 mt-2">
      <button
        onClick={handleAddSet}
        className="rounded-[4px] bg-primary text-text-black text-[10px] w-[46%] h-[28px]"
      >
        Add Set
      </button>
      <button
        onClick={handleDeleteSet}
        className="rounded-[4px] bg-bg-surface-variant text-text-white text-[10px] w-[46%] h-[28px]"
      >
        Delete Set
      </button>
    </div>
  );
};

export default SetActions;
