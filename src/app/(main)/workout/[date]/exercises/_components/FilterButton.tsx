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
        "text-[10px] rounded-md w-12 min-w-12 max-w-12 h-[28px] px-1",
        isSelected ? "bg-primary text-text-black" : "bg-[#212121]"
      )}
    >
      {label}
    </button>
  );
}

export default FilterButton;
