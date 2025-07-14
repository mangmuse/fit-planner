import React from "react";
import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import StartWorkoutSection from "./StartWorkoutSection";
import mockRouter from "next-router-mock";
import { MemoryRouterProvider } from "next-router-mock/dist/MemoryRouterProvider";
import userEvent from "@testing-library/user-event";
import { getFormattedDateYMD, getCurrentKoreanTime } from "@/util/formatDate";

jest.mock("@/util/formatDate", () => ({
  ...jest.requireActual("@/util/formatDate"),
  getCurrentKoreanTime: jest.fn(),
}));

const mockGetCurrentKoreanTime = getCurrentKoreanTime as jest.MockedFunction<
  typeof getCurrentKoreanTime
>;

describe("StartWorkoutSection", () => {
  const testDate = new Date(2024, 0, 1);
  const mockDayjs = dayjs(testDate);

  beforeEach(() => {
    mockGetCurrentKoreanTime.mockReturnValue(mockDayjs);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("오늘 날짜가 올바르게 출력된다", async () => {
    const Component = await StartWorkoutSection();
    render(Component, { wrapper: MemoryRouterProvider });

    const formattedDate = mockDayjs.format("M월 D일 dddd");
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  it("오늘의 운동 시작하기 버튼 클릭 시 /workout:date 경로로 이동한다", async () => {
    const Component = await StartWorkoutSection();
    render(Component, { wrapper: MemoryRouterProvider });

    mockRouter.setCurrentUrl("/home");
    expect(mockRouter.asPath).toEqual("/home");

    const button = screen.getByRole("link");
    await userEvent.click(button);

    const today = getFormattedDateYMD(mockDayjs.toDate());
    expect(mockRouter.asPath).toEqual(`/workout/${today}`);
  });
});
