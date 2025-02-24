import clsx from "clsx";
import dayjs from "dayjs";
import Link from "next/link";

export type CalendarCellProps = {
  day: number | null;
  month: number;
  year: number;
  daysStatus: {
    [date: string]: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  };
};

const CalendarCell = ({ day, month, year, daysStatus }: CalendarCellProps) => {
  const getDayClass = () => {
    const dateStr = dayjs()
      .year(year)
      .month(month)
      .date(day!)
      .format("YYYY-MM-DD");

    const dayStatus = daysStatus[dateStr];
    const isToday = dayjs().format("YYYY-MM-DD") === dateStr;
    return clsx("w-9 h-9 flex justify-center items-center rounded-full", {
      "opacity-75 bg-primary  text-text-black font-semibold":
        dayStatus === "COMPLETED",
      "bg-gray-400 opacity-75 text-text-black":
        dayStatus === "PLANNED" || dayStatus === "IN_PROGRESS",
      " opacity-100 font-semibold": isToday,
    });
  };

  return (
    <td className="text-center h-11 w-11">
      {day && (
        <Link
          href={`/workout/${dayjs(`${year}-${month + 1}-${day}`).format(
            "YYYY-MM-DD"
          )}`}
          className={getDayClass()}
        >
          {day}
        </Link>
      )}
    </td>
  );
};

export default CalendarCell;
