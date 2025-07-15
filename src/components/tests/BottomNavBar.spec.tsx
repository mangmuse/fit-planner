import { render, screen } from "@testing-library/react";
import BottomNavBar from "../BottomNavBar/BottomNavBar";
import { usePathname } from "next/navigation";

jest.mock("next/navigation");

const mockedUsePathname = jest.mocked(usePathname);

describe("BottomNavBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("허용된 경로에서 4개의 네비게이션 아이템을 렌더링한다", () => {
    mockedUsePathname.mockReturnValue("/home");

    render(<BottomNavBar />);

    expect(screen.getByText("홈")).toBeInTheDocument();
    expect(screen.getByText("루틴")).toBeInTheDocument();
    expect(screen.getByText("설정")).toBeInTheDocument();
  });

  it("각 아이템이 올바른 경로를 가진다", () => {
    mockedUsePathname.mockReturnValue("/home");

    render(<BottomNavBar />);

    expect(screen.getByRole("link", { name: "홈" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "루틴" })).toHaveAttribute(
      "href",
      "/routines"
    );

    expect(screen.getByRole("link", { name: "설정" })).toHaveAttribute(
      "href",
      "/settings"
    );
  });

  describe("활성 상태", () => {
    it("/home 경로에서 홈 아이템이 활성화된다", () => {
      mockedUsePathname.mockReturnValue("/home");

      render(<BottomNavBar />);

      const homeLink = screen.getByRole("link", { name: "홈" });
      const homeItem = homeLink.querySelector("li");
      expect(homeItem).toHaveAttribute("aria-label", "활성화");

      const routinesLink = screen.getByRole("link", { name: "루틴" });
      const routinesItem = routinesLink.querySelector("li");
      expect(routinesItem).toHaveAttribute("aria-label", "비활성화");

      const settingsLink = screen.getByRole("link", { name: "설정" });
      const settingsItem = settingsLink.querySelector("li");
      expect(settingsItem).toHaveAttribute("aria-label", "비활성화");
    });

    it("/routines 경로에서 루틴 아이템이 활성화된다", () => {
      mockedUsePathname.mockReturnValue("/routines");

      render(<BottomNavBar />);

      const homeLink = screen.getByRole("link", { name: "홈" });
      const homeItem = homeLink.querySelector("li");
      expect(homeItem).toHaveAttribute("aria-label", "비활성화");

      const routinesLink = screen.getByRole("link", { name: "루틴" });
      const routinesItem = routinesLink.querySelector("li");
      expect(routinesItem).toHaveAttribute("aria-label", "활성화");

      const settingsLink = screen.getByRole("link", { name: "설정" });
      const settingsItem = settingsLink.querySelector("li");
      expect(settingsItem).toHaveAttribute("aria-label", "비활성화");
    });

    it("/settings 경로에서 설정 아이템이 활성화된다", () => {
      mockedUsePathname.mockReturnValue("/settings");

      render(<BottomNavBar />);

      const homeLink = screen.getByRole("link", { name: "홈" });
      const homeItem = homeLink.querySelector("li");
      expect(homeItem).toHaveAttribute("aria-label", "비활성화");

      const routinesLink = screen.getByRole("link", { name: "루틴" });
      const routinesItem = routinesLink.querySelector("li");
      expect(routinesItem).toHaveAttribute("aria-label", "비활성화");

      const settingsLink = screen.getByRole("link", { name: "설정" });
      const settingsItem = settingsLink.querySelector("li");
      expect(settingsItem).toHaveAttribute("aria-label", "활성화");
    });
  });

  it("허용되지 않은 경로에서는 렌더링되지 않는다", () => {
    mockedUsePathname.mockReturnValue("/login");

    const { container } = render(<BottomNavBar />);

    expect(container.firstChild).toBeNull();
  });
});
