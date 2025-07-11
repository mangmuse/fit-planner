import { LocalExercise } from "@/types/models";
import clsx from "clsx";
import Image from "next/image";
import arrowIcon from "public/right-arrow.svg";

type GroupOptionItemProps = {
  label: string;
  className?: string;
  imgSrc: string;
  exercise: LocalExercise;
  onClick: () => void;
  showArrow?: boolean;
  showBottomBorder?: boolean;
};

const GroupOptionItem = ({
  imgSrc,
  label,
  className: labelColor,
  showArrow = true,
  onClick,
  showBottomBorder,
}: GroupOptionItemProps) => {
  return (
    <li
      onClick={onClick}
      data-testid="group-option-item"
      data-has-bottom-border={showBottomBorder || false}
      className={clsx(
        "flex h-11 justify-between border-t-2 border-border-gray",
        {
          "border-b-2": showBottomBorder,
        }
      )}
    >
      <div className="flex gap-2 items-center">
        <div className="w-6">
          <Image src={imgSrc} alt={label} />
        </div>
        <span
          data-testid="item-label"
          data-has-custom-class={!!labelColor}
          className={`flex text-xs text ${labelColor}`}
        >
          {label}
        </span>
      </div>
      {showArrow && <Image src={arrowIcon} alt="바로가기" />}
    </li>
  );
};

export default GroupOptionItem;
