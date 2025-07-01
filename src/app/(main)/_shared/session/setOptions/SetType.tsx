import { WorkoutSetType } from "@/app/(main)/workout/constants";
import clsx from "clsx";

export type SetTypeProps = {
  setType: WorkoutSetType;
  onChange: (value: WorkoutSetType["value"]) => void;
  isSelected: boolean;
};

const SetType = ({ setType, isSelected, onChange }: SetTypeProps) => {
  const { value, label, bgColor, textColor } = setType;

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      onClick={() => onChange(value)}
      className={clsx(
        "text-sm w-20 h-8 rounded-md",
        isSelected && [bgColor, textColor, "font-bold"],
        !isSelected && "bg-[#444444] text-white"
      )}
    >
      {label}
    </button>
  );
};

export default SetType;
