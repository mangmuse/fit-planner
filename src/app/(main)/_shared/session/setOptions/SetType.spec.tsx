import SetType, {
  SetTypeProps,
} from "@/app/(main)/_shared/session/setOptions/SetType";
import { WorkoutSetType } from "@/app/(main)/workout/constants";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSetType: WorkoutSetType = {
  value: "WARMUP",
  label: "웜업세트",
  shortLabel: "W",
  bgColor: "bg-[#C7FFE0]",
  textColor: "text-[#1AD66E]",
};

describe("SetType", () => {
  const mockOnChange = jest.fn();
  const renderSetType = (props?: Partial<SetTypeProps>) => {
    const defaultProps: SetTypeProps = {
      setType: mockSetType,
      onChange: mockOnChange,
      isSelected: false,
    };
    render(<SetType {...defaultProps} {...props} />);
  };

  it("전달받은 세트타입이 렌더링된다", () => {
    renderSetType();

    const setType = screen.getByRole("tab", { name: "웜업세트" });
    expect(setType).toHaveTextContent("웜업세트");
  });

  it("isSelected 에 따른 변화가 올바르게 적용된다", () => {
    renderSetType({ isSelected: true });

    const setType = screen.getByRole("tab", { name: "웜업세트" });
    expect(setType).toHaveAttribute("aria-selected", "true");
  });

  it("클릭 시 onChange가 호출된다", async () => {
    renderSetType();

    const setType = screen.getByRole("tab", { name: "웜업세트" });
    await userEvent.click(setType);

    expect(mockOnChange).toHaveBeenCalledWith(mockSetType.value);
  });
});
