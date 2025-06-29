import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterButton, { FilterButtonProps } from "./FilterButton";

describe("FilterButton", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderFilterButton = (
    overrides: Partial<FilterButtonProps<string>> = {}
  ) => {
    const props = {
      label: "테스트",
      onClick: mockOnClick,
      isSelected: false,
      ...overrides,
    };
    return render(<FilterButton {...props} />);
  };

  it("주어진 label을 올바르게 렌더링해야 한다", () => {
    renderFilterButton();

    expect(screen.getByRole("tab", { name: "테스트" })).toBeInTheDocument();
  });

  it("isSelected가 true일 때, data-is-selected 속성이 true여야 한다", () => {
    renderFilterButton({ isSelected: true });

    const button = screen.getByRole("tab", { name: "테스트" });
    expect(button).toHaveAttribute("aria-selected", "true");
  });

  it("isSelected가 false일 때, data-is-selected 속성이 false여야 한다", () => {
    renderFilterButton();

    const button = screen.getByRole("tab", { name: "테스트" });
    expect(button).toHaveAttribute("aria-selected", "false");
  });

  it("버튼을 클릭하면 onClick 핸들러가 올바른 label과 함께 호출되어야 한다", async () => {
    const user = userEvent.setup();
    renderFilterButton();

    await user.click(screen.getByRole("tab", { name: "테스트" }));

    expect(mockOnClick).toHaveBeenCalledWith("테스트");
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
