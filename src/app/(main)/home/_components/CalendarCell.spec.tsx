import CalendarCell, {
  CalendarCellProps,
} from "@/app/(main)/home/_components/CalendarCell";
import { customRender, screen } from "@/test-utils/test-utils";
import userEvent from "@testing-library/user-event";
import MockDate from "mockdate";
import { MemoryRouterProvider } from "next-router-mock/dist/MemoryRouterProvider";
import mockRouter from "next-router-mock";
import dayjs from "dayjs";

describe("CalendarCell", () => {
  beforeEach(() => {
    MockDate.set("2025-01-01");
  });
  afterEach(() => {
    MockDate.reset();
  });

  const mockDaysStatus: {
    [date: string]: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  } = {
    "2025-01-01": "COMPLETED",
    "2025-01-05": "PLANNED",
    "2025-01-15": "PLANNED",
  };
  const renderCalendarCell = (props?: Partial<CalendarCellProps>) => {
    return customRender(
      <table>
        <tbody>
          <tr>
            <CalendarCell
              day={5}
              month={0}
              year={2025}
              daysStatus={mockDaysStatus}
              {...props}
            />
          </tr>
        </tbody>
      </table>,
      { wrapper: MemoryRouterProvider }
    );
  };
  it("전달받은 날짜를 출력한다", async () => {
    renderCalendarCell();
    const day = await screen.findByText(5);
    expect(day).toBeInTheDocument();
  });

  it("day가 오늘의 날짜가 아닌경우 opacity-75 가 적용된다", async () => {
    renderCalendarCell();
    const day = await screen.findByText(5);
    expect(day).toHaveClass("opacity-75");
  });
  it("day가 오늘의 날짜와 일치할경우 opacity-100 가 적용된다", async () => {
    MockDate.set("2025-01-05");

    renderCalendarCell();
    const day = await screen.findByText(5);
    expect(day).toHaveClass("opacity-100");
  });
  it("해당 날짜에 완료되지 않은 계획된 운동이 있으면 bg-gray-400 이 적용된다", async () => {
    renderCalendarCell();
    const day = await screen.findByText(5);
    expect(day).toHaveClass("bg-gray-400");
  });
  it("해당 날짜에 완료된 운동이 있으면 bg-primary 가 적용된다", async () => {
    renderCalendarCell({ day: 1 });
    const day = await screen.findByText(1);
    expect(day).toHaveClass("bg-primary");
  });

  it("날짜를 클릭하면 해당 날짜의 workoutPage로 이동한다", async () => {
    renderCalendarCell();
    const day = await screen.findByText(5);
    await userEvent.click(day);
    expect(mockRouter.asPath).toEqual("/workout/2025-01-05");
  });

  it("day가 null인경우 셀은 렌더링되지만 버튼이 렌더링되지 않는다", () => {
    renderCalendarCell({ day: null });
    const linkElement = screen.queryByRole("link");
    expect(linkElement).not.toBeInTheDocument();
    const cells = screen.getByRole("cell");
    expect(cells).toBeInTheDocument();
  });
});
