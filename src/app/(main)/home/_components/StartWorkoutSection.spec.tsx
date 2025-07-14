import React from "react";
import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import StartWorkoutSection from "./StartWorkoutSection";
import mockRouter from "next-router-mock";
import { MemoryRouterProvider } from "next-router-mock/dist/MemoryRouterProvider";
import userEvent from "@testing-library/user-event";
import { 
  getCurrentKoreanDateYMD, 
  getCurrentKoreanDateFormatted 
} from "@/util/formatDate";

jest.mock("@/util/formatDate", () => ({
  ...jest.requireActual("@/util/formatDate"),
  getCurrentKoreanDateYMD: jest.fn(),
  getCurrentKoreanDateFormatted: jest.fn(),
}));

const mockGetCurrentKoreanDateYMD = getCurrentKoreanDateYMD as jest.MockedFunction<
  typeof getCurrentKoreanDateYMD
>;
const mockGetCurrentKoreanDateFormatted = getCurrentKoreanDateFormatted as jest.MockedFunction<
  typeof getCurrentKoreanDateFormatted
>;

describe("StartWorkoutSection", () => {
  const testDate = new Date(2024, 0, 1);
  const mockDayjs = dayjs(testDate);
  const mockFormattedDate = "1월 1일 월요일";
  const mockDateYMD = "2024-01-01";

  beforeEach(() => {
    mockGetCurrentKoreanDateYMD.mockReturnValue(mockDateYMD);
    mockGetCurrentKoreanDateFormatted.mockReturnValue(mockFormattedDate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("오늘 날짜가 올바르게 출력된다", async () => {
    const Component = await StartWorkoutSection();
    render(Component, { wrapper: MemoryRouterProvider });

    expect(screen.getByText(mockFormattedDate)).toBeInTheDocument();
  });

  it("오늘의 운동 시작하기 버튼 클릭 시 /workout:date 경로로 이동한다", async () => {
    const Component = await StartWorkoutSection();
    render(Component, { wrapper: MemoryRouterProvider });

    mockRouter.setCurrentUrl("/home");
    expect(mockRouter.asPath).toEqual("/home");

    const button = screen.getByRole("link");
    await userEvent.click(button);

    expect(mockRouter.asPath).toEqual(`/workout/${mockDateYMD}`);
  });
});
