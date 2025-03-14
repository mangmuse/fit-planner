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
    padding: "8px",
    border: "1px solid white",
    borderRadius: "4px",
    backgroundColor: "#333333",
    opacity: isDragging ? 0 : 1,
    cursor: "grab",
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {value}
    </li>
  );
};

export default SortableItem;
