import React from "react";
import { act, render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import StartWorkoutSection from "./StartWorkoutSection";
import mockRouter from "next-router-mock";
import { MemoryRouterProvider } from "next-router-mock/dist/MemoryRouterProvider";
import userEvent from "@testing-library/user-event";
import { getFormattedDateYMD } from "@/util/formatDate";

describe("StartWorkoutSection", () => {
  const testDate = new Date(2024, 0, 1);

  jest.useFakeTimers();
  jest.setSystemTime(testDate);

  render(<StartWorkoutSection />, { wrapper: MemoryRouterProvider });
  it("오늘 날짜가 올바르게 출력된다", () => {
    const today = dayjs(new Date(2024, 0, 1));

    const formattedDate = today.format("M월 D일 dddd");
    expect(screen.getByText(formattedDate)).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("오늘의 운동 시작하기 버튼 클릭 시 /workout:date 경로로 이동한다", async () => {
    render(<StartWorkoutSection />, { wrapper: MemoryRouterProvider });
    await act(async () => {
      mockRouter.setCurrentUrl("/home");
    });
    expect(mockRouter.asPath).toEqual("/home");
    const button = screen.getByRole("link");
    await userEvent.click(button);
    const today = getFormattedDateYMD();

    expect(mockRouter.asPath).toEqual(`/workout/${today}`);
  });
});
