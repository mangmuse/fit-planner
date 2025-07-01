"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

type SortableItemProps = {
  id: string;
  value: string;
};

const SortableItem = ({ id, value }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none" as const,
    WebkitUserSelect: "none" as const,
    userSelect: "none" as const,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-bg-surface rounded-lg px-4 py-3 flex items-center justify-between hover:bg-bg-surface-variant active:bg-bg-surface-variant transition-colors touch-none"
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-0.5 w-6 justify-center p-2 -m-2">
          <div className="h-[2px] bg-text-muted rounded-full"></div>
          <div className="h-[2px] bg-text-muted rounded-full"></div>
          <div className="h-[2px] bg-text-muted rounded-full"></div>
        </div>
        <span className="text-text-white font-medium">{value}</span>
      </div>
    </li>
  );
};

export default SortableItem;
