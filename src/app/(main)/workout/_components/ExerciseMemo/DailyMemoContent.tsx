import AddMemoButton from "@/app/(main)/workout/_components/ExerciseMemo/AddMemoButton";
import DailyMemoForm from "@/app/(main)/workout/_components/ExerciseMemo/DailyMemoForm";
import { getFormattedDateYMD } from "@/util/formatDate";

type DailyMemoContentProps = {
  isWritingNew: boolean;
  setIsWritingNew: (isWriting: boolean) => void;
  newMemoText: string;
  setNewMemoText: (text: string) => void;
};

const DailyMemoContent = ({
  isWritingNew,
  newMemoText,
  setIsWritingNew,
  setNewMemoText,
}: DailyMemoContentProps) => {
  const mockDailyMemos = [
    { date: "2025-06-10", content: "오늘 컨디션 최고! 모든 세트 완료" },
    { date: "2025-06-03", content: "어깨 불편해서 무게 줄임" },
    { date: "2025-05-28", content: "5kg 증량 성공!" },
    { date: "2025-05-21", content: "폼 수정 - 팔꿈치 각도 조정" },
    { date: "2025-05-14", content: "휴식 후 첫 운동, 가볍게 진행" },
    { date: "2025-05-14", content: "휴식 후 첫 운동, 가볍게 진행" },
    { date: "2025-05-14", content: "휴식 후 첫 운동, 가볍게 진행" },
    { date: "2025-05-14", content: "휴식 후 첫 운동, 가볍게 진행" },
  ];
  const today = getFormattedDateYMD(new Date().toISOString());

  return (
    <div className="flex flex-col h-[250px] overflow-y-auto scrollbar-none mt-3 mb-16">
      {!isWritingNew ? (
        <DailyMemoForm setIsWritingNew={setIsWritingNew} today={today} />
      ) : (
        <AddMemoButton
          newMemoText={newMemoText}
          setIsWritingNew={setIsWritingNew}
          setNewMemoText={setNewMemoText}
        />
      )}

      <div className="  mt-3 space-y-2 flex-1 max-h-[180px] flex-shrink-1">
        {mockDailyMemos.map((memo, index) => (
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
