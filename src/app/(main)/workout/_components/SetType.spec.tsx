import SetType, {
  SetTypeProps,
} from "@/app/(main)/workout/_components/SetType";
import { SET_TYPES } from "@/app/(main)/workout/constants";
import { customRender, render, screen } from "@/test-utils/test-utils";
import userEvent from "@testing-library/user-event";

describe("SetType", () => {
  const setType = SET_TYPES[0];
  const renderSetType = (props?: Partial<SetTypeProps>) => {
    const onChangeMock = jest.fn();
    customRender(
      <SetType
        isSelected={false}
        onChange={onChangeMock}
        setType={setType}
        {...props}
      />
    );
    return { onChangeMock };
  };
  it("전달받은 setType의 label을 올바르게 렌더링한다", async () => {
    renderSetType();
    const label = await screen.findByText(setType.label);
    expect(label).toBeInTheDocument();
  });
  it("isSelected가 true인 경우 전달받은 setType의 textColor와 bgColor, 그리고 font-bold 클래스가 적용된다", async () => {
    renderSetType({ isSelected: true });
    const btn = await screen.findByRole("button");
    expect(btn).toHaveClass(
      `${setType.bgColor} ${setType.textColor} font-bold`
    );
  });
  it("isSelected가 false인 경우 bg-[#444444]와 text-white 클래스가 적용된다 ", async () => {
    renderSetType();
    const btn = await screen.findByRole("button");
    expect(btn).toHaveClass("bg-[#444444] text-white");
  });
  it("컴포넌트를 클릭할 경우 올바르게 onChange를 호출한다", async () => {
    const { onChangeMock } = renderSetType();
    const btn = await screen.findByRole("button");
    await userEvent.click(btn);
    expect(onChangeMock).toHaveBeenCalledWith(setType.value);
  });
});
