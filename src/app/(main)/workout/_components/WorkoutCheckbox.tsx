import { workoutDetailService } from "@/services/workoutDetail.service";
import { useState } from "react";
import Image from "next/image";
import checkIcon from "public/check.svg";

export type WorkoutCheckboxProps = {
  prevIsDone?: boolean;
  id?: number;
  reload?: () => Promise<void>;
};

const WorkoutCheckbox = ({ prevIsDone, id, reload }: WorkoutCheckboxProps) => {
  const [isDone, setIsDone] = useState<boolean>(prevIsDone ?? false);

  const handleChange = async () => {
    if (!id) return;
    const newValue = !isDone;
    setIsDone(newValue);
    await workoutDetailService.updateLocalWorkoutDetail({
      isDone: newValue,
      id,
    });
    if (reload) reload();
  };
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        onChange={handleChange}
        type="checkbox"
        checked={isDone}
        className="sr-only peer"
      />
      <div className="relative flex items-center justify-center w-[16px] h-[16px] rounded border-[1.5px] border-text-muted peer-checked:bg-primary peer-checked:border-primary transition-all duration-200">
        {isDone && <Image src={checkIcon} alt="완료" width={10} height={10} />}
      </div>
    </label>
  );
};

export default WorkoutCheckbox;
