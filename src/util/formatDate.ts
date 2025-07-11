import dayjs from "@/util/dayjsSetup";

export const getFormattedDate = (date?: string) => {
  return dayjs(date).format("M월 D일 dddd");
};

export const getFormattedDateWithoutDay = (date?: string) => {
  return dayjs(date).format("M월 D일");
};

export const getFormattedDateYMD = (date?: Date | string) => {
  return dayjs(date).format("YYYY-MM-DD");
};

export const getMonthRange = (year: number, month: number) => {
  const start = dayjs()
    .year(year)
    .month(month)
    .startOf("month")
    .format("YYYY-MM-DD");
  const end = dayjs()
    .year(year)
    .month(month)
    .endOf("month")
    .format("YYYY-MM-DD");
  return { start, end };
};

export const getCurrentKoreanTime = () => {
  return dayjs().tz("Asia/Seoul");
};

export const formatToKoreanTime = (date?: Date | string) => {
  return dayjs(date).tz("Asia/Seoul");
};
