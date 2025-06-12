"use client";

import { getFormattedDateYMD, getMonthRange } from "@/util/formatDate";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import rightArrow from "public/calendar-arrow-right.svg";
import leftArrow from "public/calendar-arrow-left.svg";
import Image from "next/image";

import { getThisMonthWorkouts } from "@/services/workout.service";
import { LocalWorkout } from "@/types/models";
import CalendarCell from "@/app/(main)/home/_components/CalendarCell";
import { useSession } from "next-auth/react";

const WorkoutCalendar = () => {
  const [currentDate, setCurrentDate] = useState<string>(getFormattedDateYMD());
  const [daysStatus, setDaysStatus] = useState<{
    [date: string]: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  }>({});
  const year = dayjs(currentDate).year();
  const month = dayjs(currentDate).month();
  const { data } = useSession();
  const { start: startDate, end: endDate } = getMonthRange(year, month);

  const firstDayOfMonth = dayjs(currentDate).startOf("month");
  const lastDayOfMonth = dayjs(currentDate).endOf("month");
  const firstDayOfMonthWeekday = firstDayOfMonth.day();

  const daysInMonth = lastDayOfMonth.date();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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

  useEffect(() => {
    const loadWorkoutsThisMonth = async () => {
      const workouts = await getThisMonthWorkouts(startDate, endDate);
      const statusMap: {
        [data: string]: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
      } = {};
      workouts.forEach((workout: LocalWorkout) => {
        if (
          workout.status === "IN_PROGRESS" ||
          workout.status === "PLANNED" ||
          workout.status === "COMPLETED"
        ) {
          const dateKey = getFormattedDateYMD(workout.date);
          statusMap[dateKey] = workout.status;
        }
        setDaysStatus(statusMap);
      });
    };

    loadWorkoutsThisMonth();
  }, [startDate, endDate]);

  const handleGoPrevMonth = () => {
    setCurrentDate(
      dayjs(currentDate).subtract(1, "month").format("YYYY-MM-DD")
    );
  };
  const handleGoNextMonth = () => {
    setCurrentDate(dayjs(currentDate).add(1, "month").format("YYYY-MM-DD"));
  };

  return (
    <div className="px-4 py-6 flex flex-col items-center w-full bg-bg-surface rounded-[20px] shadow-sm">
      <header className="flex items-center gap-4 mb-4">
        <button 
          aria-label="prevMonthBtn" 
          onClick={handleGoPrevMonth}
          className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
        >
          <Image src={leftArrow} alt="prev-month" width={20} height={20} />
        </button>
        <span className="text-lg font-medium min-w-[100px] text-center">
          {year}년 {month + 1}월
        </span>
        <button 
          aria-label="nextMonthBtn" 
          onClick={handleGoNextMonth}
          className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
        >
          <Image src={rightArrow} alt="next-month" width={20} height={20} />
        </button>
      </header>
      <table className="w-full text-sm">
        <thead>
          <tr className="h-8">
            <th>일</th>
            <th>월</th>
            <th>화</th>
            <th>수</th>
            <th>목</th>
            <th>금</th>
            <th>토</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, index) => (
            <tr className="h-10" key={index}>
              {week.map((day, dayIndex) => (
                <CalendarCell
                  key={dayIndex}
                  daysStatus={daysStatus}
                  year={year}
                  month={month}
                  day={day}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkoutCalendar;
