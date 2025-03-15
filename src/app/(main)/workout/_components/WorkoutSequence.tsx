"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "@/app/(main)/workout/_components/SortableItem";
import { LocalWorkoutDetail } from "@/types/models";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { updateLocalWorkoutDetail } from "@/services/workoutDetail.service";
import { reorderDetailGroups } from "@/app/(main)/workout/_utils/getGroupedDetails";

export type DetailGroup = {
  exerciseOrder: number;
  details: LocalWorkoutDetail[];
};

type WorkoutSequenceProps = {
  detailGroups: DetailGroup[];
  loadLocalWorkoutDetails: () => Promise<void>;
};

const SwapExerciseOrder = ({
  detailGroups: initialGroups,
  loadLocalWorkoutDetails,
}: WorkoutSequenceProps) => {
  const { closeBottomSheet } = useBottomSheet();
  const [groups, setGroups] = useState<DetailGroup[]>(initialGroups);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }
    if (active.id !== over.id) {
      setGroups((prevGroups) =>
        reorderDetailGroups(
          prevGroups,
          active.id.toString(),
          over.id.toString()
        )
      );
    }
    setActiveId(null);
  };
  const loadReorder = async () => {
    for (const group of groups) {
      for (const detail of group.details) {
        await updateLocalWorkoutDetail({
          id: detail.id,
          exerciseOrder: group.exerciseOrder,
        });
      }
    }

    await loadLocalWorkoutDetails?.();
    closeBottomSheet();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext
        items={groups.map((group) => group.exerciseOrder.toString())}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col gap-2.5">
          {groups.map((group) => (
            <SortableItem
              key={group.exerciseOrder.toString()}
              id={group.exerciseOrder.toString()}
              value={group.details[0].exerciseName}
            />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <div className="p-2 border rounded  shadow">
            {
              groups.find(
                (group) => group.exerciseOrder.toString() === activeId
              )?.details[0].exerciseName
            }
          </div>
        ) : null}
      </DragOverlay>
      <button onClick={loadReorder}>확인버튼</button>
    </DndContext>
  );
};

export default SwapExerciseOrder;
