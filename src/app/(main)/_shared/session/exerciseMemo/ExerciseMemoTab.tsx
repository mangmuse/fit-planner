type ExerciseMemoTabProps = {
  activeTab: "fixed" | "today";
  onSelect: (tab: "fixed" | "today") => void;
};

const ExerciseMemoTab = ({ activeTab, onSelect }: ExerciseMemoTabProps) => {
  return (
    <div className="flex mt-4 bg-bg-surface rounded-lg p-1">
      <button
        role="tab"
        aria-selected={activeTab === "fixed"}
        onClick={() => onSelect("fixed")}
        className={`flex-1 py-2 px-4 rounded-md text-xs font-medium transition-colors ${
          activeTab === "fixed" ? "bg-bg-secondary text-white" : "text-gray-400"
        }`}
      >
        고정 메모
      </button>
      <button
        role="tab"
        aria-selected={activeTab === "today"}
        onClick={() => onSelect("today")}
        className={`flex-1 py-2 px-4 rounded-md text-xs font-medium transition-colors ${
          activeTab === "today" ? "bg-bg-secondary text-white" : "text-gray-400"
        }`}
      >
        날짜별 메모
      </button>
    </div>
  );
};

export default ExerciseMemoTab;
