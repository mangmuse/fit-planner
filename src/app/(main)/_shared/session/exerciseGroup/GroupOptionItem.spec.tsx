import { mockExercise } from "@/__mocks__/exercise.mock";
import GroupOptionItem from "./GroupOptionItem";
import { LocalExercise } from "@/types/models";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("GroupOptionItem", () => {
  const mockOnClick = jest.fn();
  const mockImgSrc = "/mock-image.svg";
  const mockExerciseData: LocalExercise = mockExercise.list[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderGroupOptionItem = (props?: {
    label?: string;
    className?: string;
    imgSrc?: string;
    exercise?: LocalExercise;
    onClick?: () => void;
    showArrow?: boolean;
    showBottomBorder?: boolean;
  }) => {
    const defaultProps = {
      label: "테스트 아이템",
      imgSrc: mockImgSrc,
      exercise: mockExerciseData,
      onClick: mockOnClick,
    };
    render(<GroupOptionItem {...defaultProps} {...props} />);
  };

  describe("렌더링", () => {
    it("라벨과 메인 이미지를 올바르게 렌더링한다", () => {
      renderGroupOptionItem();

      expect(screen.getByText("테스트 아이템")).toBeInTheDocument();

      const mainImage = screen.getByAltText("테스트 아이템");
      expect(mainImage).toBeInTheDocument();
      expect(mainImage).toHaveAttribute("src", mockImgSrc);
    });

    it("className이 제공되면 data-has-custom-class가 true가 된다", () => {
      renderGroupOptionItem({ className: "text-red-500" });

      const label = screen.getByTestId("item-label");
      expect(label).toHaveAttribute("data-has-custom-class", "true");
    });

    it("className이 제공되지 않으면 data-has-custom-class가 false가 된다", () => {
      renderGroupOptionItem();

      const label = screen.getByTestId("item-label");
      expect(label).toHaveAttribute("data-has-custom-class", "false");
    });

    it("기본적으로 화살표 아이콘을 표시한다", () => {
      renderGroupOptionItem();

      expect(screen.getByAltText("바로가기")).toBeInTheDocument();
    });

    it("showArrow가 false일 때 화살표 아이콘을 숨긴다", () => {
      renderGroupOptionItem({ showArrow: false });

      expect(screen.queryByAltText("바로가기")).not.toBeInTheDocument();
    });

    it("showBottomBorder가 true일 때 data-has-bottom-border가 true가 된다", () => {
      renderGroupOptionItem({ showBottomBorder: true });

      const listItem = screen.getByTestId("group-option-item");
      expect(listItem).toHaveAttribute("data-has-bottom-border", "true");
    });

    it("showBottomBorder가 false일 때 data-has-bottom-border가 false가 된다", () => {
      renderGroupOptionItem({ showBottomBorder: false });

      const listItem = screen.getByTestId("group-option-item");
      expect(listItem).toHaveAttribute("data-has-bottom-border", "false");
    });
  });

  describe("상호작용", () => {
    it("클릭 시 onClick 핸들러가 호출된다", async () => {
      const user = userEvent.setup();
      renderGroupOptionItem();

      const listItem = screen.getByTestId("group-option-item");
      await user.click(listItem);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });
});
