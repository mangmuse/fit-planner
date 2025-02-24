import { updateLocalWorkoutDetail } from "@/services/workoutDetail.service";
import { useState } from "react";

export type WorkoutCheckboxProps = {
  prevIsDone?: boolean;
  id?: number;
  loadLocalWorkoutDetails?: () => Promise<void>;
};

const WorkoutCheckbox = ({
  prevIsDone,
  id,
  loadLocalWorkoutDetails,
}: WorkoutCheckboxProps) => {
  const [isDone, setIsDone] = useState<boolean>(prevIsDone ?? false);

  const handleChange = async () => {
    if (!id) return;
    const newValue = !isDone;
    setIsDone(newValue);
    await updateLocalWorkoutDetail({ isDone: newValue, id });
    if (loadLocalWorkoutDetails) loadLocalWorkoutDetails();
  };
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        onChange={handleChange}
        type="checkbox"
        checked={isDone}
        className="sr-only peer"
      />
      <div className="flex w-[14px] h-[14px] rounded-full border-[2px] border-text-muted peer-checked:bg-primary peer-checked:border-none" />
    </label>
  );
};

export default WorkoutCheckbox;
