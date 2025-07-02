import { LocalExercise } from "@/types/models";

type DailyMemoItemProps = {
  memo: NonNullable<LocalExercise["exerciseMemo"]>["daily"][0];
  isToday: boolean;
};

const DailyMemoItem = ({ memo, isToday }: DailyMemoItemProps) => {
  return (
    <div className="bg-bg-surface rounded-lg p-3 text-xs">
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium opacity-70">
          {memo.date}
          {isToday && <span className="text-primary ml-1">(오늘)</span>}
        </span>
      </div>
      <p className="text-[11px] opacity-90 leading-relaxed">{memo.content}</p>
    </div>
  );
};

export default DailyMemoItem;