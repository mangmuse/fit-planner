import RPEItem from "@/app/(main)/_shared/session/setOptions/RPEItem";
import RPESelector, {
  RPESelectorProps,
} from "@/app/(main)/_shared/session/setOptions/RPESelector";
import { RPE_OPTIONS } from "@/app/(main)/workout/constants";
import { render, screen } from "@testing-library/react";

jest.mock("@/app/(main)/_shared/session/setOptions/RPEItem", () => {
  return jest.fn(({ rpeOption, isSelected }) => (
    <div
      data-testid={`mock-rpe-item-${rpeOption?.value}`}
      data-is-selected={isSelected}
    ></div>
  ));
});

const mockRPEItem = jest.mocked(RPEItem);

describe("RPESelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockOnChange = jest.fn();
  const renderRPESelector = (props?: Partial<RPESelectorProps>) => {
    const defaultProps: RPESelectorProps = {
      selectedRpe: null,
      onChange: mockOnChange,
    };
    render(<RPESelector {...defaultProps} {...props} />);
  };

  it("RPE_OPTIONS 배열의 모든 항목을 RPEItem 컴포넌트로 렌더링 해야한다", () => {
    renderRPESelector();
    expect(mockRPEItem).toHaveBeenCalledTimes(RPE_OPTIONS.length);
  });

  it("selectedRpe와 일치하는 RPEItem 컴포넌트에만 isSelected가 true로 전달해야한다", () => {
    renderRPESelector({ selectedRpe: 7 });

    const selectedRPEItem = screen.getByTestId("mock-rpe-item-7");
    const unselectedRPEItem = screen.getByTestId("mock-rpe-item-8.5");

    expect(selectedRPEItem).toBeInTheDocument();
    expect(selectedRPEItem).toHaveAttribute("data-is-selected", "true");

    expect(unselectedRPEItem).toBeInTheDocument();
    expect(unselectedRPEItem).toHaveAttribute("data-is-selected", "false");
  });

  it("onChange prop을 RPEItem 컴포넌트에 올바르게 전달해야한다", () => {
    renderRPESelector();

    const lastCallProps =
      mockRPEItem.mock.calls[mockRPEItem.mock.calls.length - 1][0];

    expect(lastCallProps.onChange).toBe(mockOnChange);
  });
});
