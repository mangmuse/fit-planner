import { RPEOption } from "@/app/(main)/workout/constants";
import clsx from "clsx";

type RPEItemProps = {
  rpeOption: RPEOption;
  isSelected: boolean;
  onChange: (value: number) => void;
};

const RPEItem = ({ rpeOption, isSelected, onChange }: RPEItemProps) => {
  const { value, activeBgColor, activeTextColor } = rpeOption;
  return (
    <button
      onClick={() => onChange(value)}
      className={clsx(
        "w-7 h-7 font-semibold text-[10px] rounded-md ",
        isSelected && [activeBgColor, activeTextColor],
        !isSelected && "bg-[#444444]"
      )}
    >
      {value}
    </button>
  );
};

export default RPEItem;
