import { render, screen } from "@testing-library/react";
import BottomNavBarItem from "../BottomNavBar/BottomNavBarItem";
import { Home } from "lucide-react";

describe("BottomNavBarItem", () => {
  it("활성 상태일 때 올바르게 렌더링된다", () => {
    render(
      <BottomNavBarItem
        path="/home"
        icon={Home}
        label="홈"
        isActive={true}
      />
    );

    expect(screen.getByText("홈")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/home");
    
    const listItem = screen.getByRole("listitem");
    expect(listItem).toHaveAttribute("aria-label", "활성화");
  });

  it("비활성 상태일 때 올바르게 렌더링된다", () => {
    render(
      <BottomNavBarItem
        path="/settings"
        icon={Home}
        label="설정"
        isActive={false}
      />
    );

    expect(screen.getByText("설정")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/settings");
    
    const listItem = screen.getByRole("listitem");
    expect(listItem).toHaveAttribute("aria-label", "비활성화");
  });
});
