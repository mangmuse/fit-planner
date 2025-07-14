import { ChevronsUpDown } from "lucide-react";
import { Trash2 } from "lucide-react";
import { ReactNode } from "react";

export type SessionHeaderProps = {
  formattedDate: string | ReactNode;
  handleDeleteAll: () => void;
  handleOpenSequenceSheet: () => void;
};

const SessionHeader = ({
  formattedDate,
  handleDeleteAll,
  handleOpenSequenceSheet,
}: SessionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6 ">
      {formattedDate &&
        (typeof formattedDate === "string" ? (
          <time className="text-2xl font-bold">{formattedDate}</time>
        ) : (
          <div className="text-2xl font-bold">{formattedDate}</div>
        ))}
      <div className="flex gap-2">
        <button
          onClick={handleDeleteAll}
          className="p-2 hover:bg-bg-surface rounded-lg transition-colors"
          aria-label="전체 삭제"
        >
          <Trash2 className="w-6 h-6 text-text-muted" />
        </button>
        <button
          onClick={handleOpenSequenceSheet}
          className="p-2 hover:bg-bg-surface rounded-lg transition-colors"
          aria-label="순서 변경"
        >
          <ChevronsUpDown className="w-6 h-6 text-text-muted" />
        </button>
      </div>
    </div>
  );
};

export default SessionHeader;
