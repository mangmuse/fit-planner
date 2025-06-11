import DailyMemoContent from "@/app/(main)/workout/_components/ExerciseMemo/DailyMemoContent";
import ExerciseMemoTab from "@/app/(main)/workout/_components/ExerciseMemo/ExerciseMemoTab";
import FixedMemoContent from "@/app/(main)/workout/_components/ExerciseMemo/FixedMemoContent";
import { useModal } from "@/providers/contexts/ModalContext";
import { updateExercise } from "@/services/exercise.service";
import { LocalExercise } from "@/types/models";
import { getFormattedDateYMD } from "@/util/formatDate";
import dayjs from "dayjs";
import { useState } from "react";

type ExerciseMemoProps = {
  exercise: LocalExercise;
  loadExercises: () => Promise<void>;
};

const ExerciseMemo = ({ exercise, loadExercises }: ExerciseMemoProps) => {
  // TODO: 메모 추가 후 리로드하는로직에서 전체 운동을 다시 불러오는부분 개선 필요
  const { closeModal } = useModal();
  const existingMemo = exercise.exerciseMemo;
  const initialMemo = existingMemo?.fixed?.content || "";

  const [memoText, setMemoText] = useState(initialMemo);
  const [activeTab, setActiveTab] = useState<"fixed" | "today">("fixed");

  const handleUpdateFixedMemo = async () => {
    if (!loadExercises) return;
    const now = dayjs().toISOString();

    const updatedFixedMemo = existingMemo?.fixed?.createdAt
      ? { ...existingMemo.fixed, content: memoText, updatedAt: now }
      : { content: memoText, createdAt: now, updatedAt: null };

    await updateExercise({
      ...exercise,
      exerciseMemo: {
        fixed: updatedFixedMemo,
        daily: existingMemo?.daily || [],
      },
    });

    await loadExercises();
    closeModal();
  };

  const handleSelectTab = (tab: "fixed" | "today") => setActiveTab(tab);

  return (
    <div className="relative flex px-6 rounded-xl text-white flex-col item-center pt-5 bg-bg-surface-variant w-80 h-[400px]">
      <span className="text-center font-semibold">{exercise.name}</span>

      <ExerciseMemoTab activeTab={activeTab} onSelect={handleSelectTab} />

      {activeTab === "fixed" && (
        <FixedMemoContent
          fixedMemo={existingMemo?.fixed || null}
          onChange={setMemoText}
          memoText={memoText}
        />
      )}
      {activeTab === "today" && (
        <DailyMemoContent
          existingMemo={existingMemo}
          dailyMemos={existingMemo?.daily || []}
          loadExercises={loadExercises}
          exercise={exercise}
        />
      )}

      <nav className="flex h-14 font-semibold w-full border-t-2 border-border-gray absolute right-0 left-0 bottom-0">
        <button
          onClick={closeModal}
          className="w-1/2 border-r-2 border-border-gray"
        >
          취소
        </button>
        <button
          disabled={
            activeTab === "fixed"
              ? !memoText.trim() && !existingMemo?.fixed
              : true
          }
          onClick={handleUpdateFixedMemo}
          className="w-1/2 text-primary disabled:opacity-30"
        >
          확인
        </button>
      </nav>
    </div>
  );
};

export default ExerciseMemo;
