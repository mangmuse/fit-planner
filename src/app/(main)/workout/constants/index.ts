export type WorkoutSetType = {
  label: "웜업세트" | "드롭세트" | "암랩세트" | "실패세트";
  bgColor: string;
  textColor: string;
};
export type RPEOption = {
  value: number;
  activeBgColor: string;
  activeTextColor: string;
};

const INFO_BG_COLOR = "bg-[#FFFDEC]";
const INFO_TEXT_COLOR = "text-[#FFEB3B]";

const SUCCESS_BG_COLOR = "bg-[#C7FFE0]";
const SUCCESS_TEXT_COLOR = "text-[#1AD66E]";

const DROP_BG_COLOR = "bg-[#E5E2FF]";
const DROP_TEXT_COLOR = "text-[#6D5BEC]";

const WARNING_BG_COLOR = "bg-[#FEF5E4]";
const WARNING_TEXT_COLOR = "text-[#DA3E06]";

const ERROR_BG_COLOR = "bg-[#FFD6D4]";
const ERROR_TEXT_COLOR = "text-[#F44336]";

export const SET_TYPES: WorkoutSetType[] = [
  {
    label: "웜업세트",
    bgColor: SUCCESS_BG_COLOR,
    textColor: SUCCESS_TEXT_COLOR,
  },
  { label: "드롭세트", bgColor: DROP_BG_COLOR, textColor: DROP_TEXT_COLOR },
  {
    label: "암랩세트",
    bgColor: WARNING_BG_COLOR,
    textColor: WARNING_TEXT_COLOR,
  },
  { label: "실패세트", bgColor: ERROR_BG_COLOR, textColor: ERROR_TEXT_COLOR },
];

export const RPE_OPTIONS: RPEOption[] = [
  { value: 5, activeBgColor: INFO_BG_COLOR, activeTextColor: INFO_TEXT_COLOR },
  {
    value: 5.5,
    activeBgColor: INFO_BG_COLOR,
    activeTextColor: INFO_TEXT_COLOR,
  },
  { value: 6, activeBgColor: INFO_BG_COLOR, activeTextColor: INFO_TEXT_COLOR },
  {
    value: 6.5,
    activeBgColor: INFO_BG_COLOR,
    activeTextColor: INFO_TEXT_COLOR,
  },
  {
    value: 7,
    activeBgColor: SUCCESS_BG_COLOR,
    activeTextColor: SUCCESS_TEXT_COLOR,
  },
  {
    value: 7.5,
    activeBgColor: SUCCESS_BG_COLOR,
    activeTextColor: SUCCESS_TEXT_COLOR,
  },
  {
    value: 8,
    activeBgColor: SUCCESS_BG_COLOR,
    activeTextColor: SUCCESS_TEXT_COLOR,
  },
  {
    value: 8.5,
    activeBgColor: WARNING_BG_COLOR,
    activeTextColor: WARNING_TEXT_COLOR,
  },
  {
    value: 9,
    activeBgColor: WARNING_BG_COLOR,
    activeTextColor: WARNING_TEXT_COLOR,
  },
  {
    value: 9.5,
    activeBgColor: WARNING_BG_COLOR,
    activeTextColor: WARNING_TEXT_COLOR,
  },
  {
    value: 10,
    activeBgColor: ERROR_BG_COLOR,
    activeTextColor: ERROR_TEXT_COLOR,
  },
];
