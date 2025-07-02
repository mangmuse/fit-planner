import React from "react";

export interface DragEndEvent {
  active: {
    id: string;
  };
  over: {
    id: string;
  } | null;
}

export interface DragStartEvent {
  active: {
    id: string;
  };
}

export interface DndContextProps {
  children: React.ReactNode;
  sensors?: unknown[];
  collisionDetection?: unknown;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragCancel?: () => void;
}

export interface DragOverlayProps {
  children: React.ReactNode;
}

export let mockOnDragEnd: ((event: DragEndEvent) => void) | null = null;
export let mockOnDragStart: ((event: DragStartEvent) => void) | null = null;

export const DndContext = ({
  children,
  onDragEnd,
  onDragStart,
}: DndContextProps) => {
  mockOnDragEnd = onDragEnd || null;
  mockOnDragStart = onDragStart || null;
  return <div>{children}</div>;
};

export const DragOverlay = ({ children }: DragOverlayProps) => {
  return <>{children}</>;
};

export const closestCenter = jest.fn();
export const PointerSensor = jest.fn();
export const TouchSensor = jest.fn();
export const useSensor = jest.fn();
export const useSensors = jest.fn(() => []);
