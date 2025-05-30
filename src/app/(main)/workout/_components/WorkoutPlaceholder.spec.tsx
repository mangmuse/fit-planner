import WorkoutPlaceholder from "@/app/(main)/workout/_components/WorkoutPlaceholder";
import { act, customRender, screen } from "@/test-utils/test-utils";
import userEvent from "@testing-library/user-event";
import { MemoryRouterProvider } from "next-router-mock/dist/MemoryRouterProvider";
import mockRouter from "next-router-mock";

describe("WorkoutPlaceholer", () => {
  const date = "2025-01-01";
  it("나의 루틴 가져오기 버튼와 운동 추가하기 버튼이 올바르게 렌더링된다", () => {
    customRender(<WorkoutPlaceholder title={date} />);
    const routineBtn = screen.getByRole("link", { name: "나의 루틴 가져오기" });
    const addExBtn = screen.getByRole("link", { name: "운동 추가하기" });
    expect(routineBtn).toBeInTheDocument();
    expect(addExBtn).toBeInTheDocument();
  });
  //   it("나의 루틴 가져오기 버튼 클릭시 루틴 페이지로 이동한다", () => {});
  it("운동 추가하기 버튼 클릭시 exercise 페이지로 이동한다", async () => {
    customRender(<WorkoutPlaceholder title={date} />, {
      wrapper: MemoryRouterProvider,
    });
    const addExBtn = screen.getByRole("link", { name: "운동 추가하기" });
    await act(async () => {
      mockRouter.setCurrentUrl(`/workout/${date}`);
    });
    await userEvent.click(addExBtn);
    expect(mockRouter.asPath).toEqual(`/workout/${date}/exercises`);
  });
});
