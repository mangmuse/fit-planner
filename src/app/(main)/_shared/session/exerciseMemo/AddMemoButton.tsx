type AddMemoButtonProps = {
  today: string;
  setIsWritingNew: (isWriting: boolean) => void;
};

const AddMemoButton = ({ setIsWritingNew, today }: AddMemoButtonProps) => {
  return (
    <button
      onClick={() => setIsWritingNew(true)}
      className=" w-full p-3 bg-bg-secondary rounded-lg text-xs text-left hover:bg-bg-surface transition-colors flex items-center justify-between flex-shrink-0"
    >
      <span className="opacity-70">+ 오늘 메모 작성</span>
      <span className="text-primary text-[10px]">{today}</span>
    </button>
  );
};

export default AddMemoButton;
