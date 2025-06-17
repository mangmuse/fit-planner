"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
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
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { updateLocalWorkoutDetail } from "@/services/workoutDetail.service";
import { reorderDetailGroups } from "@/app/(main)/workout/_utils/getGroupedDetails";
import { isWorkoutDetail } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { updateLocalRoutineDetail } from "@/services/routineDetail.service";

export type DetailGroup = {
  exerciseOrder: number;
  details: LocalWorkoutDetail[] | LocalRoutineDetail[];
};

type WorkoutSequenceProps = {
  detailGroups: DetailGroup[];
  reload: () => Promise<void>;
};

const WorkoutSequence = ({
  detailGroups: initialGroups,
  reload,
}: WorkoutSequenceProps) => {
  // TODO: 드래그 종료 시 아이템이 원위치로 돌아갔다가 재배치되는 시각적 문제 해결
  const { closeBottomSheet } = useBottomSheet();
  const [groups, setGroups] = useState<DetailGroup[]>(initialGroups);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

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
        const updateInput = {
          id: detail.id,
          exerciseOrder: group.exerciseOrder,
        };
        if (isWorkoutDetail(detail)) {
          await updateLocalWorkoutDetail(updateInput);
        } else {
          await updateLocalRoutineDetail(updateInput);
        }
      }
    }

    await reload?.();
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
          <div className="bg-primary rounded-lg px-4 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-0.5 w-6 justify-center">
                <div className="h-[2px] bg-text-black rounded-full"></div>
                <div className="h-[2px] bg-text-black rounded-full"></div>
                <div className="h-[2px] bg-text-black rounded-full"></div>
              </div>
              <span className="text-text-black font-semibold">
                {
                  groups.find(
                    (group) => group.exerciseOrder.toString() === activeId
                  )?.details[0].exerciseName
                }
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
      <button
        onClick={loadReorder}
        className="w-full mt-4 py-3 bg-primary text-text-black font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all"
      >
        순서 변경 완료
      </button>
    </DndContext>
  );
};

export default WorkoutSequence;
