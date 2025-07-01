import RPEItem, {
  RPEItemProps,
} from "@/app/(main)/_shared/session/setOptions/RPEItem";
import { RPE_OPTIONS, RPEOption } from "@/app/(main)/workout/constants";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockRPEOption: RPEOption = RPE_OPTIONS[0];

describe("RPEItem", () => {
  const mockOnChange = jest.fn();

  const renderRPEItem = (props?: Partial<RPEItemProps>) => {
    const defaultProps: RPEItemProps = {
      rpeOption: mockRPEOption,
      isSelected: false,
      onChange: mockOnChange,
    };
    render(<RPEItem {...defaultProps} {...props} />);
  };

  it("isSelected 에 따른 변화가 올바르게 적용된다(true)", () => {
    renderRPEItem({ isSelected: true });

    const rpeItem = screen.getByRole("tab", {
      name: mockRPEOption.value.toString(),
    });

    expect(rpeItem).toBeInTheDocument();
    expect(rpeItem).toHaveAttribute("aria-selected", "true");
  });
  it("isSelected 에 따른 변화가 올바르게 적용된다(false)", () => {
    renderRPEItem({ isSelected: false });

    const rpeItem = screen.getByRole("tab", {
      name: mockRPEOption.value.toString(),
    });

    expect(rpeItem).toBeInTheDocument();
    expect(rpeItem).toHaveAttribute("aria-selected", "false");
  });
  it("클릭하면 onChange가 호출된다", async () => {
    renderRPEItem();

    const rpeItem = screen.getByRole("tab", {
      name: mockRPEOption.value.toString(),
    });
    await userEvent.click(rpeItem);

    expect(mockOnChange).toHaveBeenCalledWith(mockRPEOption.value);
  });
});
