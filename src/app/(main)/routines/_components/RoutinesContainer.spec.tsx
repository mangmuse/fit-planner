import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoutinesContainer from "./RoutinesContainer";
import { useRouter } from "next/navigation";
import RoutineList from "@/app/(main)/routines/_components/routineList/RoutineList";

// 1. 의존성 모킹
jest.mock("next/navigation");
jest.mock("@/app/(main)/routines/_components/routineList/RoutineList", () => {
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="mock-routine-list" />),
  };
});

const mockedUseRouter = jest.mocked(useRouter);

describe("RoutinesContainer", () => {
  const mockPush = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
    });
  });

  it("새 루틴 버튼과 RoutineList 컴포넌트를 렌더링해야 한다", () => {
    render(<RoutinesContainer />);

    expect(
      screen.getByRole("button", { name: /새 루틴/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-routine-list")).toBeInTheDocument();
  });

  it("새 루틴 버튼을 클릭하면 /routines/create 페이지로 이동해야 한다", async () => {
    render(<RoutinesContainer />);
    const addButton = screen.getByRole("button", { name: /새 루틴/i });

    await user.click(addButton);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/routines/create");
  });
});
