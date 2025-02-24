import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

export const getFormattedDate = (date?: string) => {
  return dayjs(date).format("M월 D일 dddd");
};
export const getFormattedDateWithoutDay = (date?: string) => {
  return dayjs(date).format("M월 D일");
};

export const getFormattedDateYMD = (date?: Date) => {
  return dayjs(date).format("YYYY-MM-DD");
};

export const hmmtest = (firstDayOfMonthWeekday, week) => {
  for (let i = 0; i < firstDayOfMonthWeekday; i++) {
    week.push(null); // 빈 칸을 추가
  }
};
