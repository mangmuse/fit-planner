import { act, render, RenderResult, screen } from "@testing-library/react";
import BottomNavBarItem from "../BottomNavBar/BottomNavBarItem";

import mockRouter from "next-router-mock";
import userEvent from "@testing-library/user-event";
import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";

const home = "/mock-home.jpg";
const activeHome = "/mock-active-home.jpg";

const user = userEvent.setup();

const renderBottomNavBarItem = (isActive: boolean = false): RenderResult => {
  return render(
    <BottomNavBarItem
      icon={home}
      activeIcon={activeHome}
      isActive={isActive}
      label="홈"
      path="/home"
    />,
    { wrapper: MemoryRouterProvider }
  );
};

it("클릭 시 props로 전달받은 path 경로로 이동한다", async () => {
  renderBottomNavBarItem();

  await act(async () => {
    mockRouter.setCurrentUrl("/routines");
  });
  expect(mockRouter.asPath).toEqual("/routines");

  const link = screen.getByRole("link");
  await user.click(link);

  expect(mockRouter.asPath).toEqual("/home");
});

describe("isActive", () => {
  it("props로 전달받은 isActive가 true인 경우 텍스트의 색상이 메인색상으로 변경된다", () => {
    renderBottomNavBarItem(true);

    const li = screen.getByRole("listitem");

    expect(li).toHaveClass("text-primary");
  });

  it("props로 전달받은 itActive가 true인 경우 icon 대신 activeIcon을 사용한다", () => {
    renderBottomNavBarItem(true);
    const image = screen.getByRole("img") as HTMLImageElement;

    expect(image.src).toContain("/mock-active-home.jpg");
    expect(image.src).not.toContain("/mock-home.jpg");
  });

  it("isActive가 false인 경우 텍스트의 색상이 회색이다", () => {
    renderBottomNavBarItem(false);
    const li = screen.getByRole("listitem");
    expect(li).toHaveClass("text-text-muted");
  });

  it("isActive가 false인 경우 icon을 이미지 src로 사용한다", () => {
    renderBottomNavBarItem(false);
    const image = screen.getByRole("img") as HTMLImageElement;
    expect(image.src).toContain("/mock-home.jpg");
    expect(image.src).not.toContain("/mock-active-home.jpg");
  });
});

describe("label", () => {
  it("props로 전달받은 label이 텍스트로 출력된다", () => {
    renderBottomNavBarItem();

    const span = screen.getByText("홈");
    expect(span).toBeInTheDocument();
  });
  it("props로 전달받은 label이 이 아이콘 이미지의 alt로 지정된다", () => {
    renderBottomNavBarItem();

    const img = screen.getByAltText("홈");
    expect(img).toBeInTheDocument();
  });
});
