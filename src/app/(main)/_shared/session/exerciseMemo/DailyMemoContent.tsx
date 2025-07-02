import AddMemoButton from "@/app/(main)/_shared/session/exerciseMemo/AddMemoButton";
import DailyMemoForm from "@/app/(main)/_shared/session/exerciseMemo/DailyMemoForm";
import { exerciseService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
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
  exercise: initialExercise,
  dailyMemos: prevMemos,
  existingMemo: initialExistingMemo,
  loadExercises,
}: DailyMemoContentProps) => {
  const initialDailyMemos =
    prevMemos.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) || [];
  const [isWritingNew, setIsWritingNew] = useState(false);
  const [dailyMemos, setDailyMemos] =
    useState<NonNullable<LocalExercise["exerciseMemo"]>["daily"]>(
      initialDailyMemos
    );

  const [currentExercise, setCurrentExercise] = useState(initialExercise);
  const [currentExistingMemo, setCurrentExistingMemo] =
    useState(initialExistingMemo);
  const { showError } = useModal();

  const today = getFormattedDateYMD(new Date().toISOString());

  const handleAddMemo = async (memoContent: string) => {
    try {
      const newDailyMemo = {
        date: today,
        content: memoContent,
        createdAt: new Date().toISOString(),
        updatedAt: null,
      };

      const updatedDailyMemos = [
        ...(currentExistingMemo?.daily || []),
        newDailyMemo,
      ];

      const updatedMemo = {
        fixed: currentExistingMemo?.fixed || null,
        daily: updatedDailyMemos,
      };

      await exerciseService.updateLocalExercise({
        ...currentExercise,
        exerciseMemo: updatedMemo,
      });

      setCurrentExistingMemo(updatedMemo);
      setCurrentExercise({
        ...currentExercise,
        exerciseMemo: updatedMemo,
      });

      const sortedMemos = updatedDailyMemos.sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
      setDailyMemos(sortedMemos);
      setIsWritingNew(false);

      await loadExercises();
    } catch (e) {
      console.error(e);
      showError("메모 저장에 실패했습니다");
    }
  };

  return (
    <div className="flex flex-col h-[250px] overflow-y-auto scrollbar-none mt-3 mb-16">
      {!isWritingNew ? (
        <AddMemoButton setIsWritingNew={setIsWritingNew} today={today} />
      ) : (
        <DailyMemoForm
          onAddMemo={handleAddMemo}
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
