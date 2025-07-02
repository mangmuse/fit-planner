import { LocalExercise } from "@/types/models";
import { getFormattedDateYMD } from "@/util/formatDate";

export type FixedMemoContentProps = {
  fixedMemo: NonNullable<LocalExercise["exerciseMemo"]>["fixed"] | null;
  memoText: string;
  onChange: (e: string) => void;
};

const FixedMemoContent = ({
  fixedMemo: existingMemo,
  memoText,
  onChange,
}: FixedMemoContentProps) => {
  return (
    <>
      <textarea
        value={memoText}
        onChange={(e) => onChange(e.target.value)}
        placeholder="머신 세팅, 의자 높이 등을 기록하세요"
        className="placeholder:opacity-50 text-xs p-3 bg-[#444444] mt-3 rounded-lg self-center w-full h-48 resize-none outline-none"
      />
      <span className="text-[10px] opacity-50 mt-1">
        마지막 수정일{" "}
        {getFormattedDateYMD(
          existingMemo?.updatedAt ?? existingMemo?.createdAt
        )}
      </span>
    </>
  );
};

export default FixedMemoContent;
