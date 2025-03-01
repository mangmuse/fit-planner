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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemoText(e.target.value);
  };

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

  return (
    <div className="relative flex px-6 rounded-xl text-white flex-col item-center pt-5 bg-bg-surface-variant w-80 h-[350px]">
      <span className="text-center font-semibold">{exercise.name}</span>
      <textarea
        value={memoText}
        onChange={handleChange}
        placeholder="메모를 입력하세요"
        className="placeholder:opacity-50 text-xs p-3 bg-[#444444] mt-4 rounded-lg self-center w-full h-48 resize-none outline-none"
      />
      <span className="text-[10px] opacity-50 mt-1">
        마지막 수정일{" "}
        {getFormattedDateYMD(
          existingMemo?.updatedAt ?? existingMemo?.createdAt
        )}
      </span>
      <nav className="flex h-14 font-semibold w-full border-t-2 border-border-gray absolute right-0 left-0 bottom-0">
        <button
          onClick={closeModal}
          className="w-1/2 border-r-2 border-border-gray"
        >
          취소
        </button>
        <button
          disabled={!memoText.trim() && !existingMemo}
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
