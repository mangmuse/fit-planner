import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorkoutCalendar from "./WorkoutCalendar";
import { workoutService } from "@/lib/di";
import { mockWorkout } from "@/__mocks__/workout.mock";

const mockedWorkoutService = jest.mocked(workoutService);

describe("WorkoutCalendar", () => {
  const mockWorkouts = [
    {
      ...mockWorkout.planned,
      date: "2025-07-10",
      status: "COMPLETED" as const,
    },
    {
      ...mockWorkout.planned,
      date: "2025-07-12",
      status: "PLANNED" as const,
    },
    {
      ...mockWorkout.planned,
      date: "2025-07-18",
      status: "IN_PROGRESS" as const,
    },
  ];

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-07-15T12:00:00.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    mockedWorkoutService.getThisMonthWorkouts.mockResolvedValue(mockWorkouts);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("초기 렌더링 시 현재 월이 표시되어야 한다", () => {
    render(<WorkoutCalendar />);

    expect(screen.getByText("2025년 7월")).toBeInTheDocument();
  });

  it("초기 렌더링 시 운동 데이터를 로드하고 CalendarCell에 상태를 전달해야 한다", async () => {
    render(<WorkoutCalendar />);

    await waitFor(() => {
      expect(mockedWorkoutService.getThisMonthWorkouts).toHaveBeenCalledWith(
        "2025-07-01",
        "2025-07-31"
      );
    });

    const completedCell = screen.getByRole("link", { name: "10" });
    expect(completedCell).toHaveAttribute("href", "/workout/2025-07-10");

    const plannedCell = screen.getByRole("link", { name: "12" });
    expect(plannedCell).toHaveAttribute("href", "/workout/2025-07-12");

    const inProgressCell = screen.getByRole("link", { name: "18" });
    expect(inProgressCell).toHaveAttribute("href", "/workout/2025-07-18");
  });

  it("다음 달 버튼을 클릭하면 8월로 이동하고 새로운 데이터를 로드해야 한다", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<WorkoutCalendar />);

    const nextButton = screen.getByRole("button", { name: "nextMonthBtn" });
    await user.click(nextButton);

    expect(screen.getByText("2025년 8월")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedWorkoutService.getThisMonthWorkouts).toHaveBeenCalledWith(
        "2025-08-01",
        "2025-08-31"
      );
    });
  });

  it("이전 달 버튼을 클릭하면 6월으로 이동하고 새로운 데이터를 로드해야 한다", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<WorkoutCalendar />);

    const prevButton = screen.getByRole("button", { name: "prevMonthBtn" });
    await user.click(prevButton);

    expect(screen.getByText("2025년 6월")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedWorkoutService.getThisMonthWorkouts).toHaveBeenCalledWith(
        "2025-06-01",
        "2025-06-30"
      );
    });
  });

  it("여러 번 월 이동을 해도 올바른 날짜 범위로 데이터를 요청해야 한다", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<WorkoutCalendar />);

    const nextButton = screen.getByRole("button", { name: "nextMonthBtn" });
    const prevButton = screen.getByRole("button", { name: "prevMonthBtn" });

    await user.click(nextButton);
    await user.click(nextButton);
    expect(screen.getByText("2025년 9월")).toBeInTheDocument();

    await user.click(prevButton);
    expect(screen.getByText("2025년 8월")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        mockedWorkoutService.getThisMonthWorkouts
      ).toHaveBeenLastCalledWith("2025-08-01", "2025-08-31");
    });
  });

  it("요일 헤더가 올바르게 렌더링되어야 한다", () => {
    render(<WorkoutCalendar />);

    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    weekdays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });
});
