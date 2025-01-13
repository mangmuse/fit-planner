import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

export const getFormattedDate = (date?: string) => {
  return dayjs(date).format("M월 D일 dddd");
};
export const getFormattedDateWithoutDay = (date?: string) => {
  return dayjs(date).format("M월 D일");
};
