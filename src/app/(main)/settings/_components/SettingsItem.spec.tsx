import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsItem, SettingsItemProps } from "./SettingsItem";

const TestIcon = () => <svg data-testid="test-icon" />;

describe("SettingsItem", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (overrides: Partial<SettingsItemProps> = {}) => {
    const defaultProps: SettingsItemProps = {
      title: "테스트 제목",
      onClick: mockOnClick,
    };
    const props = { ...defaultProps, ...overrides };
    return render(<SettingsItem {...props} />);
  };

  describe("렌더링", () => {
    it("모든 props가 제공되면 올바르게 렌더링해야 한다", () => {
      renderComponent({
        title: "테스트 제목",
        description: "테스트 설명",
        icon: <TestIcon />,
      });

      expect(screen.getByText("테스트 제목")).toBeInTheDocument();
      expect(screen.getByText("테스트 설명")).toBeInTheDocument();
      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("옵션 props가 제공되지 않아도 올바르게 렌더링해야 한다", () => {
      renderComponent({
        title: "테스트 제목",
        onClick: undefined,
        description: undefined,
        icon: undefined,
        className: undefined,
      });

      expect(screen.getByText("테스트 제목")).toBeInTheDocument();
      expect(screen.queryByText("테스트 설명")).not.toBeInTheDocument();
      expect(screen.queryByTestId("test-icon")).not.toBeInTheDocument();
    });
  });

  describe("상호작용", () => {
    const user = userEvent.setup();

    describe("onClick 핸들러가 있을 때", () => {
      it("버튼으로 렌더링되어야 한다", () => {
        renderComponent({ onClick: mockOnClick });
        expect(
          screen.getByRole("button", { name: /테스트 제목/ })
        ).toBeInTheDocument();
      });

      it("클릭 시 onClick 핸들러를 호출해야 한다", async () => {
        renderComponent({ onClick: mockOnClick });

        const button = screen.getByRole("button", { name: /테스트 제목/ });
        await user.click(button);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });

      it("disabled 상태일 때 버튼이 비활성화되고 클릭되지 않아야 한다", async () => {
        renderComponent({ onClick: mockOnClick, disabled: true });

        const button = screen.getByRole("button", { name: /테스트 제목/ });
        expect(button).toBeDisabled();

        await user.click(button);
        expect(mockOnClick).not.toHaveBeenCalled();
      });
    });

    describe("onClick 핸들러가 없을 때", () => {
      it("버튼이 아닌 요소로 렌더링되어야 한다", () => {
        renderComponent({ onClick: undefined });
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        expect(screen.getByText("테스트 제목")).toBeInTheDocument();
      });

      it("클릭해도 아무 일도 일어나지 않아야 한다", async () => {
        renderComponent({ onClick: undefined });

        const element = screen.getByText("테스트 제목");
        await user.click(element);
        expect(mockOnClick).not.toHaveBeenCalled();
      });
    });
  });
});
