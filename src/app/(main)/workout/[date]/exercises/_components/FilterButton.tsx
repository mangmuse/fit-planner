import { clsx } from "clsx";

interface FilterButtonProps<T extends string> {
  label: T;
  onClick: (value: T) => void;
  isSelected: boolean;
}

function FilterButton<T extends string>({
  label,
  onClick,
  isSelected,
}: FilterButtonProps<T>) {
  return (
    <button
      data-is-selected={isSelected}
      onClick={() => onClick?.(label)}
      className={clsx(
        "text-xs rounded-md h-8 min-w-[60px] px-3 transition-all",
        isSelected ? "bg-primary text-text-black font-medium" : "bg-[#212121] text-text-muted"
      )}
    >
      {label}
    </button>
  );
}

export default FilterButton;
