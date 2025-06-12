export const EXERCISETYPELIST = ["전체", "커스텀", "즐겨찾기"] as const;
export const CATEGORY_OPTIONS = [
  "가슴",
  "등",
  "하체",
  "어깨",
  "팔",
  "코어",
] as const;
export const CATEGORY_LIST = ["전체", ...CATEGORY_OPTIONS] as const;
