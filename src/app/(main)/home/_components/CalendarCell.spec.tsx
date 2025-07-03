import React from "react";
import { render, screen } from "@testing-library/react";
import CalendarCell, { CalendarCellProps } from "./CalendarCell";

describe("CalendarCell", () => {
  const baseProps: Omit<CalendarCellProps, "day"> = {
    month: 6, // 7월 (0-indexed)
    year: 2025,
    daysStatus: {
      "2025-07-16": "PLANNED",
      "2025-07-17": "IN_PROGRESS",
      "2025-07-18": "COMPLETED",
    },
  };

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-07-15T12:00:00.000Z")); // 2025-07-15를 오늘로 설정
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const renderCell = (props: {
    day?: number | null;
    month?: number;
    year?: number;
    daysStatus?: { [date: string]: "PLANNED" | "IN_PROGRESS" | "COMPLETED" };
    isWeekend?: boolean;
  }) => {
    const finalProps: CalendarCellProps = {
      ...baseProps,
      ...props,
      day: props.day !== undefined ? props.day : null,
    };

    return render(
      <table>
        <tbody>
          <tr>
            <CalendarCell {...finalProps} />
          </tr>
        </tbody>
      </table>
    );
  };

  describe("렌더링", () => {
    it("day가 null이면 빈 셀을 렌더링해야 한다", () => {
      renderCell({ day: null });

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      const cell = screen.getByRole("cell");
      expect(cell).toHaveClass("h-10");
    });

    it("day가 있으면 링크가 렌더링되어야 한다", () => {
      renderCell({ day: 20 });

      const link = screen.getByRole("link", { name: "20" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/workout/2025-07-20");
    });
  });

  describe("날짜별 상태", () => {
    it("오늘 날짜(15일)는 링크가 존재하고 올바른 href를 가져야 한다", () => {
      renderCell({ day: 15 });

      const link = screen.getByRole("link", { name: "15" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/workout/2025-07-15");
    });

    it("운동 완료(COMPLETED) 날짜는 올바른 링크를 가져야 한다", () => {
      renderCell({ day: 18 });

      const link = screen.getByRole("link", { name: "18" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/workout/2025-07-18");
    });

    it("운동 예정(PLANNED) 날짜는 올바른 링크를 가져야 한다", () => {
      renderCell({ day: 16 });

      const link = screen.getByRole("link", { name: "16" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/workout/2025-07-16");
    });

    it("운동 진행중(IN_PROGRESS) 날짜는 올바른 링크를 가져야 한다", () => {
      renderCell({ day: 17 });

      const link = screen.getByRole("link", { name: "17" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/workout/2025-07-17");
    });

    it("일반 날짜는 올바른 링크를 가져야 한다", () => {
      renderCell({ day: 21 });

      const link = screen.getByRole("link", { name: "21" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/workout/2025-07-21");
    });
  });

  describe("주말", () => {
    it("주말이면서 운동 상태가 없는 날짜도 링크가 렌더링되어야 한다", () => {
      renderCell({ day: 19, isWeekend: true }); // 2025-07-19는 토요일

      const link = screen.getByRole("link", { name: "19" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/workout/2025-07-19");
    });

    it("주말이면서 운동 상태가 있는 날짜도 정상 링크를 가져야 한다", () => {
      const propsWithWeekendStatus = {
        ...baseProps,
        daysStatus: {
          ...baseProps.daysStatus,
          "2025-07-19": "COMPLETED" as const,
        },
      };

      render(
        <table>
          <tbody>
            <tr>
              <CalendarCell
                {...propsWithWeekendStatus}
                day={19}
                isWeekend={true}
              />
            </tr>
          </tbody>
        </table>
      );

      const link = screen.getByRole("link", { name: "19" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/workout/2025-07-19");
    });
  });

  describe("날짜 형식 처리", () => {
    it("월의 경계를 올바르게 처리해야 한다", () => {
      renderCell({ day: 31, month: 6 }); // 7월 31일

      const link = screen.getByRole("link", { name: "31" });
      expect(link).toHaveAttribute("href", "/workout/2025-07-31");
    });

    it("월 초를 올바르게 처리해야 한다", () => {
      renderCell({ day: 1, month: 6 }); // 7월 1일

      const link = screen.getByRole("link", { name: "1" });
      expect(link).toHaveAttribute("href", "/workout/2025-07-01");
    });
  });
});
