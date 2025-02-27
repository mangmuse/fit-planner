import { WorkoutSetType } from "@/app/(main)/workout/constants";
import clsx from "clsx";

type SetTypeProps = {
  setType: WorkoutSetType;
  onChange: (label: WorkoutSetType["label"]) => void;
  isSelected: boolean;
};

const SetType = ({ setType, isSelected, onChange }: SetTypeProps) => {
  const { label, bgColor, textColor } = setType;

  return (
    <button
      onClick={() => onChange(label)}
      className={clsx(
        " text-sm w-20 h-8 rounded-md",
        isSelected && [bgColor, textColor, "font-bold"],
        !isSelected && "bg-[#444444] text-white"
      )}
    >
      {label}
    </button>
  );
};

export default SetType;
