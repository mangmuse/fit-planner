import AddMemoButton from "@/app/(main)/_shared/session/exerciseMemo/AddMemoButton";
import DailyMemoForm from "@/app/(main)/_shared/session/exerciseMemo/DailyMemoForm";
import { LocalExercise } from "@/types/models";
import { getFormattedDateYMD } from "@/util/formatDate";
import { useState } from "react";

type DailyMemoContentProps = {
  dailyMemos: NonNullable<LocalExercise["exerciseMemo"]>["daily"];
  existingMemo: LocalExercise["exerciseMemo"];
  exercise: LocalExercise;
  loadExercises: () => Promise<void>;
};

const DailyMemoContent = ({
  exercise,
  dailyMemos: prevMemos,
  existingMemo,
  loadExercises,
}: DailyMemoContentProps) => {
  const initialDailyMemos =
    prevMemos.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) || [];
  const [isWritingNew, setIsWritingNew] = useState(false);
  const [dailyMemos, setDailyMemos] =
    useState<NonNullable<LocalExercise["exerciseMemo"]>["daily"]>(
      initialDailyMemos
    );

  const today = getFormattedDateYMD(new Date().toISOString());

  const handleAddDailyMemo = async (
    updatedMemos: NonNullable<LocalExercise["exerciseMemo"]>["daily"]
  ) => {
    const sortedMemos = updatedMemos.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    setDailyMemos(sortedMemos);
    await loadExercises();
  };

  return (
    <div className="flex flex-col h-[250px] overflow-y-auto scrollbar-none mt-3 mb-16">
      {!isWritingNew ? (
        <AddMemoButton setIsWritingNew={setIsWritingNew} today={today} />
      ) : (
        <DailyMemoForm
          existingMemo={existingMemo}
          exercise={exercise}
          today={today}
          onAdd={handleAddDailyMemo}
          setIsWritingNew={setIsWritingNew}
        />
      )}

      <div className="  mt-3 space-y-2 flex-1 max-h-[180px] flex-shrink-1">
        {dailyMemos.length > 0 &&
          dailyMemos.map((memo, index) => (
            <div key={index} className="bg-bg-surface rounded-lg p-3 text-xs">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium opacity-70">
                  {memo.date}
                  {memo.date === today && (
                    <span className="text-primary ml-1">(오늘)</span>
                  )}
                </span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {memo.content}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DailyMemoContent;
