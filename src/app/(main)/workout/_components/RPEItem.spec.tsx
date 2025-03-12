import RPEItem, {
  RPEItemProps,
} from "@/app/(main)/workout/_components/RPEItem";
import { RPE_OPTIONS } from "@/app/(main)/workout/constants";
import { customRender, screen } from "@/test-utils/test-utils";
import userEvent from "@testing-library/user-event";

describe("RPEItem", () => {
  const renderRPEItem = (props?: Partial<RPEItemProps>) => {
    const onChangeMock = jest.fn();
    customRender(
      <RPEItem
        rpeOption={RPE_OPTIONS[0]}
        isSelected={false}
        onChange={onChangeMock}
        {...props}
      />
    );
    return { onChangeMock };
  };
  it("전달받은 rpe를 올바르게 렌더링한다", async () => {
    renderRPEItem();
    const result = await screen.findByText(RPE_OPTIONS[0].value);
    expect(result.textContent).toBe("5");
  });
  it("클릭을 하면 onChange가 올바르게 호출된다", async () => {
    const { onChangeMock } = renderRPEItem();
    const rpeItemButton = screen.getByRole("button");
    await userEvent.click(rpeItemButton);
    expect(onChangeMock).toHaveBeenCalledWith(RPE_OPTIONS[0].value);
  });
  it("isSelected가 true인 경우 rpeOption의 activeBgColor와 activeTextColor 클래스가 적용된다", () => {
    const { activeBgColor, activeTextColor } = RPE_OPTIONS[0];
    renderRPEItem({ isSelected: true });
    const rpeItemButton = screen.getByRole("button");
    expect(rpeItemButton).toHaveClass(activeBgColor);
    expect(rpeItemButton).toHaveClass(activeTextColor);
  });

  it("isSelected가 false인 경우 bg-[#444444] 클래스가 적용된다", () => {
    renderRPEItem();
    const rpeItemButton = screen.getByRole("button");
    expect(rpeItemButton).toHaveClass("bg-[#444444]");
  });
});
