import SetType from "@/app/(main)/_shared/session/setOptions/SetType";
import SetTypeSelector, {
  SetTypeSelectorProps,
} from "@/app/(main)/_shared/session/setOptions/SetTypeSelector";
import { SET_TYPES } from "@/app/(main)/workout/constants";
import { render, screen } from "@testing-library/react";

jest.mock("@/app/(main)/_shared/session/setOptions/SetType", () => {
  return jest.fn(({ setType, isSelected }) => (
    <div
      data-testid={`mock-set-type-${setType?.value}`}
      data-is-selected={isSelected}
    ></div>
  ));
});

const mockSetType = jest.mocked(SetType);

describe("SetTypeSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockOnChange = jest.fn();
  const renderSetTypeSelector = (props?: Partial<SetTypeSelectorProps>) => {
    const defaultProps: SetTypeSelectorProps = {
      selectedSetType: null,
      onChange: mockOnChange,
    };
    render(<SetTypeSelector {...defaultProps} {...props} />);
  };

  it("SET_TYPES 배열의 모든 항목을 SetType 컴포넌트로 렌더링 해야한다", () => {
    renderSetTypeSelector();
    expect(mockSetType).toHaveBeenCalledTimes(SET_TYPES.length);
  });
  it("selectedSetType과 일치하는 SetType 컴포넌트에만 isSelected가 true로 전달해야한다", () => {
    renderSetTypeSelector({ selectedSetType: "WARMUP" });

    const selectedSetType = screen.getByTestId("mock-set-type-WARMUP");
    const unselectedSetType = screen.getByTestId("mock-set-type-DROP");

    expect(selectedSetType).toBeInTheDocument();
    expect(selectedSetType).toHaveAttribute("data-is-selected", "true");

    expect(unselectedSetType).toBeInTheDocument();
    expect(unselectedSetType).toHaveAttribute("data-is-selected", "false");
  });

  it("onChange prop을 SetType 컴포넌트에 올바르게 전달해야한다", () => {
    renderSetTypeSelector();

    const lastCallProps =
      mockSetType.mock.calls[mockSetType.mock.calls.length - 1][0];

    expect(lastCallProps.onChange).toBe(mockOnChange);
  });
});
