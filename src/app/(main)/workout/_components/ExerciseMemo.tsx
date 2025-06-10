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
  const { closeModal } = useModal();
  const existingMemo = exercise.exerciseMemo;
  const initialMemo = existingMemo?.content || "";

  const [memoText, setMemoText] = useState(initialMemo);
  const [activeTab, setActiveTab] = useState<"fixed" | "today">("fixed");
  const [isWritingNew, setIsWritingNew] = useState(false);
  const [newMemoText, setNewMemoText] = useState("");

  const handleUpdateMemo = async () => {
    if (!loadExercises) return;
    const now = dayjs().toISOString();

    let updatedMemo;
    if (existingMemo?.createdAt) {
      updatedMemo = {
        ...existingMemo,
        content: memoText,
        updatedAt: now,
      };
    } else {
      updatedMemo = {
        content: memoText,
        createdAt: now,
      };
    }

    await updateExercise({
      ...exercise,
      exerciseMemo: updatedMemo,
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
          existingMemo={existingMemo}
          onChange={setMemoText}
          memoText={memoText}
        />
      )}
      {activeTab === "today" && (
        <DailyMemoContent
          isWritingNew={isWritingNew}
          newMemoText={newMemoText}
          setIsWritingNew={setIsWritingNew}
          setNewMemoText={setNewMemoText}
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
            activeTab === "fixed" ? !memoText.trim() && !existingMemo : true
          }
          onClick={handleUpdateMemo}
          className="w-1/2 text-primary disabled:opacity-30"
        >
          확인
        </button>
      </nav>
    </div>
  );
};

export default ExerciseMemo;
