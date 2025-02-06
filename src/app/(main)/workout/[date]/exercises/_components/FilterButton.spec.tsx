import { fireEvent, render, screen } from "@testing-library/react";
import FilterButton from "./FilterButton";
const renderFilterButton = ({
  label = "test",
  isSelected,
  onClick,
}: {
  label?: string;
  isSelected?: boolean;
  onClick?: () => void;
} = {}) => {
  return render(
    <FilterButton label={label} isSelected={isSelected} onClick={onClick} />
  );
};
describe("FilterButton", () => {
  it("버튼 클릭시 props로 전달받은 label과 함께 onClick을 호출한다", () => {
    const mockOnClick = jest.fn();
    const label = "test";

    renderFilterButton({ label, onClick: mockOnClick });

    const button = screen.getByText(label);
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledWith(label);
  });

  it("props로 전달받은 label이 버튼에 렌더링된다", () => {
    const label = "test";

    renderFilterButton({ label });

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("props로 전달받은 isSelected가 true일 경우 버튼에 bg-primary, text-text-black 클래스명이 추가된다", () => {
    const label = "test";

    const { container } = renderFilterButton({ label, isSelected: true });

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("bg-primary", "text-text-black");
  });

  it("props로 전달받은 isSelected가 false일 경우 bg-[#212121] 클래스명이 추가된다", () => {
    const label = "test";

    const { container } = renderFilterButton({ label, isSelected: false });

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("bg-[#212121]");
  });

  it("기본 클래스명이 올바르게 적용된다", () => {
    const label = "test";

    const { container } = renderFilterButton({ label });

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass(
      "text-[10px]",
      "rounded-md",
      "w-12",
      "min-w-12",
      "max-w-12",
      "h-[28px]",
      "px-1"
    );
  });
});
