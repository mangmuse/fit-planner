"use client";

import {
  getFormattedDate,
  getFormattedDateYMD,
  getCurrentKoreanTime,
} from "@/util/formatDate";
import Link from "next/link";

const StartWorkoutSection = () => {
  const now = getCurrentKoreanTime();
  const formattedDate = getFormattedDate(now.toISOString());
  const today = getFormattedDateYMD(now.toDate());

  return (
    <section className="flex flex-col justify-between p-4 mb-6 w-full h-28 rounded-[20px] bg-bg-surface shadow-sm">
      <p className="text-base" suppressHydrationWarning>
        {formattedDate}
      </p>
      <Link
        href={`/workout/${today}`}
        className="flex text-base justify-center items-center w-full font-semibold h-11 rounded-xl bg-primary text-text-black hover:bg-opacity-90 transition-colors"
      >
        오늘의 운동 시작하기
      </Link>
    </section>
  );
};

export default StartWorkoutSection;
