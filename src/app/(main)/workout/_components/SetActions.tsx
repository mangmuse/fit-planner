"use client";

import useWorkoutMutation from "@/hooks/api/mutation/useWorkoutMutation";
import { PostWorkoutDetailInput } from "@/types/dto/workoutDetail.dto";

type SetActionsProps = {
  postWorkoutDetailInput: PostWorkoutDetailInput;
  workoutDetailId: string;
};

const SetActions = ({
  postWorkoutDetailInput,
  workoutDetailId,
}: SetActionsProps) => {
  const { addWorkoutDetail, removeWorkoutDetail } = useWorkoutMutation();
  const handleAddSet = async () =>
    await addWorkoutDetail(postWorkoutDetailInput);
  const handleDeleteSet = async () =>
    await removeWorkoutDetail(workoutDetailId);
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
