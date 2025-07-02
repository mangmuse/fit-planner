import { useState } from "react";

export type DailyMemoFormProps = {
  onAddMemo: (memoContent: string) => void;
  setIsWritingNew: (isWriting: boolean) => void;
};

const DailyMemoForm = ({ onAddMemo, setIsWritingNew }: DailyMemoFormProps) => {
  const [newMemoText, setNewMemoText] = useState("");

  const handleSaveDailyMemo = () => {
    if (!newMemoText.trim()) return;

    onAddMemo(newMemoText);
    setNewMemoText("");
  };

  return (
    <div className="bg-bg-secondary  rounded-lg p-3 mb-2 flex-shrink-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium">오늘 메모</span>
        <button
          onClick={() => {
            setIsWritingNew(false);
            setNewMemoText("");
          }}
          className="text-[10px] text-gray-400"
        >
          취소
        </button>
      </div>
      <textarea
        value={newMemoText}
        onChange={(e) => setNewMemoText(e.target.value)}
        placeholder="오늘의 특이사항을 기록하세요"
        className="placeholder:opacity-50 text-xs p-2 bg-bg-surface rounded w-full h-20 resize-none outline-none"
        autoFocus
      />
      <button
        onClick={handleSaveDailyMemo}
        disabled={!newMemoText.trim()}
        className="mt-2 w-full py-1 bg-primary rounded text-xs disabled:opacity-30"
      >
        저장
      </button>
    </div>
  );
};

export default DailyMemoForm;
