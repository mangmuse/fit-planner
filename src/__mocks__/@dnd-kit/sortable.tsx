import React from "react";

export const mockUseSortableReturn = {
  attributes: {},
  listeners: {},
  setNodeRef: jest.fn(),
  transform: null,
  transition: undefined,
  isDragging: false,
  active: null,
  activeIndex: -1,
  data: { current: null },
  rect: { current: null },
  over: null,
  index: 0,
  isSorting: false,
  node: { current: null },
  setActivatorNodeRef: jest.fn(),
  setDroppableNodeRef: jest.fn(),
  setDraggableNodeRef: jest.fn(),
};

export const useSortable = jest.fn(() => mockUseSortableReturn);

// SessionSequence에서 사용하는 SortableContext mock
export interface SortableContextProps {
  items: string[];
  strategy?: unknown;
  children: React.ReactNode;
}

export const SortableContext = ({ children }: SortableContextProps) => {
  return <>{children}</>;
};

export const verticalListSortingStrategy = jest.fn();
