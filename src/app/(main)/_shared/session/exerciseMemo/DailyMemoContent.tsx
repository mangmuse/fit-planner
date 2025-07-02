import AddMemoButton from "@/app/(main)/_shared/session/exerciseMemo/AddMemoButton";
import DailyMemoForm from "@/app/(main)/_shared/session/exerciseMemo/DailyMemoForm";
import DailyMemoItem from "@/app/(main)/_shared/session/exerciseMemo/DailyMemoItem";
import { exerciseService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { LocalExercise } from "@/types/models";
import { getFormattedDateYMD } from "@/util/formatDate";
import { useState } from "react";

export type DailyMemoContentProps = {
  dailyMemos: NonNullable<LocalExercise["exerciseMemo"]>["daily"];
  exercise: LocalExercise;
  loadExercises: () => Promise<void>;
};

const DailyMemoContent = ({
  exercise: initialExercise,
  dailyMemos: prevMemos,
  loadExercises,
}: DailyMemoContentProps) => {
  const initialDailyMemos =
    [...prevMemos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) || [];
  const [isWritingNew, setIsWritingNew] = useState(false);
  const [dailyMemos, setDailyMemos] =
    useState<NonNullable<LocalExercise["exerciseMemo"]>["daily"]>(
      initialDailyMemos
    );

  const [currentExercise, setCurrentExercise] = useState(initialExercise);
  const { showError } = useModal();

  const today = getFormattedDateYMD(new Date().toISOString());
  const createUpdatedMemo = (memoContent: string) => {
    const newDailyMemo = {
      date: today,
      content: memoContent,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };

    const updatedDailyMemos = [
      ...(currentExercise.exerciseMemo?.daily || []),
      newDailyMemo,
    ];

    const updatedMemo = {
      fixed: currentExercise.exerciseMemo?.fixed || null,
      daily: updatedDailyMemos,
    };

    return { updatedDailyMemos, updatedMemo };
  };
  const handleAddMemo = async (memoContent: string) => {
    try {
      const { updatedDailyMemos, updatedMemo } = createUpdatedMemo(memoContent);

      await exerciseService.updateLocalExercise({
        ...currentExercise,
        exerciseMemo: updatedMemo,
      });

      setCurrentExercise({
        ...currentExercise,
        exerciseMemo: updatedMemo,
      });

      const sortedMemos = [...updatedDailyMemos].sort((a, b) =>
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
            <DailyMemoItem
              key={index}
              memo={memo}
              isToday={memo.date === today}
            />
          ))}
      </div>
    </div>
  );
};

export default DailyMemoContent;
