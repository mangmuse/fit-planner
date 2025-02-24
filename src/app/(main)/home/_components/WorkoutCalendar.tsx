"use client";

import { getFormattedDateYMD, hmmtest } from "@/util/formatDate";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import rightArrow from "public/calendar-arrow-right.svg";
import leftArrow from "public/calendar-arrow-left.svg";
import Image from "next/image";
import clsx from "clsx";
import Link from "next/link";

const WorkoutCalendar = () => {
  const [currentDate, setCurrentDate] = useState<string>(getFormattedDateYMD());

  const year = dayjs(currentDate).year();
  const month = dayjs(currentDate).month();
  console.log(year, "year");
  console.log(month, "month");

  const firstDayOfMonth = dayjs(currentDate).startOf("month");
  const lastDayOfMonth = dayjs(currentDate).endOf("month");
  const firstDayOfMonthWeekday = firstDayOfMonth.day();

  const daysInMonth = lastDayOfMonth.date();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  console.log(days);

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = [];

  (() => {
    for (let i = 0; i < firstDayOfMonthWeekday; i++) {
      week.push(null);
    }
  })();

  days.forEach((day) => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = []; //
    }
  });

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  return (
    <div className="px-2.5 py-8 flex flex-col items-center w-full h-[367px] bg-bg-surface rounded-[30px]">
      <header className="flex gap-2.5">
        <Image src={leftArrow} alt="prev-month" />
        <span>
          {year}년 {month + 1}월
        </span>
        <Image src={rightArrow} alt="next-month" />
      </header>
      <table className="gap2 w-full text-sm  mt-2.5">
        <thead>
          <tr className="mb-3">
            <th>일</th>
            <th>월</th>
            <th>화</th>
            <th>수</th>
            <th>목</th>
            <th>금</th>
            <th>토</th>
          </tr>
        </thead>
        <tbody className="mt-2">
          {weeks.map((week, index) => (
            <tr className="h-9" key={index}>
              {week.map((day, dayIndex) => (
                <td key={dayIndex} className="text-center h-11 w-11">
                  {day && (
                    <Link
                      href={`/workout/${dayjs(
                        `${year}-${month + 1}-${day}`
                      ).format("YYYY-MM-DD")}`}
                      className={clsx(
                        "w-9 h-9 flex justify-center items-center rounded-full",
                        {
                          "bg-primary text-text-black font-bold":
                            day === dayjs(currentDate).date(),
                        }
                      )}
                    >
                      {day}
                    </Link>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkoutCalendar;
