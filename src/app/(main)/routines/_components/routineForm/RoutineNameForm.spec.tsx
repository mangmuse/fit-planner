import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoutineNameForm from "./RoutineNameForm";
import { routineService } from "@/lib/di";
import { useRouter } from "next/navigation";

jest.mock("@/lib/di");
jest.mock("next/navigation");

const mockedRoutineService = jest.mocked(routineService);
const mockedUseRouter = jest.mocked(useRouter);

describe("RoutineNameForm", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      push: mockPush,
      refresh: jest.fn(),
      replace: jest.fn(),
    });
  });

  describe("렌더링", () => {
    it("입력 필드를 렌더링하고, 버튼은 처음에는 보이지 않는다", () => {
      render(<RoutineNameForm />);

      expect(
        screen.getByPlaceholderText("루틴 이름을 입력하세요")
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "루틴 만들러 가기" })
      ).not.toBeInTheDocument();
    });
  });

  describe("상호작용", () => {
    const user = userEvent.setup();

    it("입력 필드에 텍스트를 입력하면 버튼이 나타난다", async () => {
      render(<RoutineNameForm />);
      const input = screen.getByPlaceholderText("루틴 이름을 입력하세요");

      await user.type(input, "새로운 루틴");

      expect(
        screen.getByRole("button", { name: "루틴 만들러 가기" })
      ).toBeInTheDocument();
    });

    it("버튼을 클릭하면 서비스 호출 후 페이지를 이동시킨다", async () => {
      const newRoutineId = 123;
      mockedRoutineService.addLocalRoutine.mockResolvedValue(newRoutineId);

      render(<RoutineNameForm />);
      const input = screen.getByPlaceholderText("루틴 이름을 입력하세요");
      const routineName = "가슴 운동하는 날";

      await user.type(input, routineName);
      const button = screen.getByRole("button", { name: "루틴 만들러 가기" });
      await user.click(button);

      expect(mockedRoutineService.addLocalRoutine).toHaveBeenCalledTimes(1);
      expect(mockedRoutineService.addLocalRoutine).toHaveBeenCalledWith(
        expect.objectContaining({ name: routineName })
      );

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(`/routines/${newRoutineId}`);
    });
  });
});
