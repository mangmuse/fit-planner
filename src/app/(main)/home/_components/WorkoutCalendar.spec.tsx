jest.mock("@/services/workout.service");
jest.mock("@/util/formatDate");
import {
  getByAltText,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import WorkoutCalendar from "@/app/(main)/home/_components/WorkoutCalendar";
import MockDate from "mockdate";
import { customRender } from "@/test-utils/test-utils";
import { LocalWorkout } from "@/types/models";
import { getThisMonthWorkouts } from "@/services/workout.service";
import userEvent from "@testing-library/user-event";
import { getFormattedDateYMD, getMonthRange } from "@/util/formatDate";
import dayjs from "dayjs";

describe("WorkoutCalendar", () => {
  const mockUserId = "testUserId";
  const mockWorkout: LocalWorkout = {
    id: 1,
    userId: mockUserId,
    date: "2025-01-01",
    isSynced: false,
    status: "PLANNED",
    serverId: null,
    createdAt: expect.any(String),
  };
  const mockWorkouts = [
    mockWorkout,
    { ...mockWorkout, id: 2, date: "2025-01-05" },
    { ...mockWorkout, id: 3, date: "2025-01-15" },
  ];
  beforeEach(() => {
    MockDate.set("2025-01-01");

    (getThisMonthWorkouts as jest.Mock).mockResolvedValue(mockWorkouts);
  });

  afterEach(() => {
    MockDate.reset();
  });

  it("달의 첫번째 날이 올바르게 렌더링되며 값이 null인 셀은 element를 가지지않는다", async () => {
    (getMonthRange as jest.Mock).mockReturnValue({
      start: "2025-01-01",
      end: "2025-01-31",
    });
    customRender(<WorkoutCalendar />);
    await waitFor(async () => {
      const rows = screen.getAllByRole("row");
      const firstBodyRow = rows[1];
      const cells = within(firstBodyRow).getAllByRole("cell");
      const header = screen.getByText("2025년 1월");
      expect(header).toBeInTheDocument();

      expect(cells[3]).toHaveTextContent("1");
      expect(cells[0]).toBeEmptyDOMElement();
      expect(cells[1]).toBeEmptyDOMElement();
      expect(cells[2]).toBeEmptyDOMElement();
    });
  });

  it("prev-month 버튼 클릭시 이전 달의 달력이 올바르게 렌더링된다", async () => {
    (getMonthRange as jest.Mock)
      .mockReturnValueOnce({
        start: "2025-01-01",
        end: "2025-01-31",
      })
      .mockReturnValueOnce({
        start: "2024-12-01",
        end: "2024-12-31",
      });
    customRender(<WorkoutCalendar />);

    const user = userEvent.setup();
    const prevBtn = screen.getByRole("button", { name: "prevMonthBtn" });
    await user.click(prevBtn);

    expect(screen.getByText("2024년 12월")).toBeInTheDocument();

    const rows = screen.getAllByRole("row");
    const firstBodyRow = rows[1];
    const cells = within(firstBodyRow).getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("1");
  });
  it("next-month 버튼 클릭시 이전 달의 달력이 올바르게 렌더링된다", async () => {
    (getMonthRange as jest.Mock)
      .mockReturnValueOnce({
        start: "2025-01-01",
        end: "2025-01-31",
      })
      .mockReturnValueOnce({
        start: "2025-02-01",
        end: "2025-02-28",
      });
    customRender(<WorkoutCalendar />);

    const user = userEvent.setup();
    const nextBtn = screen.getByRole("button", { name: "nextMonthBtn" });
    await user.click(nextBtn);

    expect(screen.getByText("2025년 2월")).toBeInTheDocument();

    const rows = screen.getAllByRole("row");
    const firstBodyRow = rows[1];
    const cells = within(firstBodyRow).getAllByRole("cell");
    expect(cells[6]).toHaveTextContent("1");
  });
});
