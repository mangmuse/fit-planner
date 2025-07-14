import clsx from "clsx";
import dayjs from "dayjs";
import Link from "next/link";
import { getCurrentKoreanDateYMD } from "@/util/formatDate";
import { useEffect, useState } from "react";

export type CalendarCellProps = {
  day: number | null;
  month: number;
  year: number;
  daysStatus: {
    [date: string]: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  };
  isWeekend?: boolean;
};

const CalendarCell = ({
  day,
  month,
  year,
  daysStatus,
  isWeekend,
}: CalendarCellProps) => {
  const [isToday, setIsToday] = useState(false);

  const dateStr = day
    ? dayjs().year(year).month(month).date(day).format("YYYY-MM-DD")
    : "";

  useEffect(() => {
    if (day && dateStr) {
      setIsToday(getCurrentKoreanDateYMD() === dateStr);
    }
  }, [dateStr, day]);

  if (!day) {
    return <td className="h-10" />;
  }

  const dayStatus = daysStatus[dateStr];

  const getDayClass = () => {
    return clsx(
      "relative w-10 h-10 flex justify-center items-center rounded-xl transition-all duration-200 text-sm",
      {
        // 오늘 날짜
        "ring-2 ring-primary font-bold": isToday,

        // 운동 상태별 스타일
        "bg-primary text-text-black font-medium hover:bg-primary/90":
          dayStatus === "COMPLETED",
        "bg-bg-secondary text-text-white":
          dayStatus === "PLANNED" || dayStatus === "IN_PROGRESS",

        // 기본 스타일
        "hover:bg-bg-secondary": !dayStatus,
        "text-text-muted": isWeekend && !dayStatus && !isToday,
      }
    );
  };

  return (
    <td className="text-center p-0.5">
      <Link href={`/workout/${dateStr}`} className={getDayClass()}>
        {day}
      </Link>
    </td>
  );
};

export default CalendarCell;
