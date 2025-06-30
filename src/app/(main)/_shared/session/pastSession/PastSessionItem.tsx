import ExpandedSessionDetailsView from "@/app/(main)/_shared/session/expandedView/ExpandedSessionDetailsView";
import { LocalWorkout } from "@/types/models";
import { useState } from "react";
import Image from "next/image";
import chevronDown from "public/chevron-down.svg";

type PastSessionItemProps = {
  workout: LocalWorkout;
};

const PastSessionItem = ({ workout }: PastSessionItemProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const handleToggleExpand = () => setIsExpanded((prev) => !prev);
  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAllSelected(!isAllSelected);
    // TODO: 실제 선택 로직 구현
  };

  return (
    <li key={workout.id} className="bg-bg-surface rounded-xl overflow-hidden">
      <div className="px-4 py-4 hover:bg-bg-surface-variant transition-colors">
        <button
          onClick={handleToggleExpand}
          className="w-full flex items-center justify-between"
        >
          <span className="text-base font-medium">{workout.date}</span>
          <Image
            src={chevronDown}
            alt="펼치기"
            width={20}
            height={20}
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
        {isExpanded && (
          <button
            onClick={handleSelectAll}
            className="mt-3 px-3 py-1.5 bg-bg-secondary rounded-lg text-sm hover:bg-bg-base transition-colors"
          >
            {isAllSelected ? "전체 해제" : "전체 선택"}
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border-gray">
          <ExpandedSessionDetailsView
            onToggle={handleToggleExpand}
            workoutId={workout.id!}
          />
        </div>
      )}
    </li>
  );
};

export default PastSessionItem;
