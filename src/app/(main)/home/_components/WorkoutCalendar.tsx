"use client";

import {
  getFormattedDateYMD,
  getMonthRange,
  getCurrentKoreanTime,
} from "@/util/formatDate";
import dayjs from "@/util/dayjsSetup";
import { useEffect, useState } from "react";
import rightArrow from "public/calendar-arrow-right.svg";
import leftArrow from "public/calendar-arrow-left.svg";
import Image from "next/image";

import { LocalWorkout } from "@/types/models";
import CalendarCell from "@/app/(main)/home/_components/CalendarCell";
import { useSession } from "next-auth/react";
import { workoutService } from "@/lib/di";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

const WorkoutCalendar = () => {
  const [currentDate, setCurrentDate] = useState<string>(
    getFormattedDateYMD(getCurrentKoreanTime().toDate())
  );
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
      const workouts = await workoutService.getThisMonthWorkouts(
        startDate,
        endDate
      );
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
    <div className="p-5 flex flex-col items-center w-full bg-bg-surface rounded-2xl shadow-sm">
      <header className="flex items-center justify-between w-full mb-6">
        <button
          aria-label="prevMonthBtn"
          onClick={handleGoPrevMonth}
          className="p-2 hover:bg-bg-secondary rounded-xl transition-all duration-200 active:scale-95"
        >
          <Image src={leftArrow} alt="prev-month" width={20} height={20} />
        </button>
        <h2 className="text-lg font-semibold">
          {year}년 {month + 1}월
        </h2>
        <button
          aria-label="nextMonthBtn"
          onClick={handleGoNextMonth}
          className="p-2 hover:bg-bg-secondary rounded-xl transition-all duration-200 active:scale-95"
        >
          <Image src={rightArrow} alt="next-month" width={20} height={20} />
        </button>
      </header>
      <table className="w-full">
        <thead>
          <tr className="text-xs text-text-muted">
            {WEEKDAYS.map((day) => (
              <th key={day} className="pb-3 font-medium">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, index) => (
            <tr key={index}>
              {week.map((day, dayIndex) => (
                <CalendarCell
                  key={dayIndex}
                  daysStatus={daysStatus}
                  year={year}
                  month={month}
                  day={day}
                  isWeekend={dayIndex === 0 || dayIndex === 6}
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
