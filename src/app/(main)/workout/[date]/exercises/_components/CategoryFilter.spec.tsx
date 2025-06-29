import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryFilter, { CategoryFilterProps } from "./CategoryFilter";
import { Category } from "@/types/filters";

describe("CategoryFilter", () => {
  const mockOnClick = jest.fn();

  const renderCategoryFilter = (
    overrides: Partial<CategoryFilterProps> = {}
  ) => {
    const props: CategoryFilterProps = {
      selectedCategory: "전체",
      onClick: mockOnClick,
      ...overrides,
    };
    return render(<CategoryFilter {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('selectedCategory prop과 일치하는 버튼에 aria-selected="true"를 적용해야 한다', () => {
    const selectedCategory: Category = "가슴";
    renderCategoryFilter({ selectedCategory });

    const selectedButton = screen.getByRole("tab", {
      name: selectedCategory,
      selected: true,
    });
    expect(selectedButton).toBeInTheDocument();

    const unselectedButton = screen.getByRole("tab", {
      name: "등",
      selected: false,
    });
    expect(unselectedButton).toBeInTheDocument();
  });

  it("버튼을 클릭하면 onClick 핸들러가 해당 버튼의 label과 함께 호출되어야 한다", async () => {
    const user = userEvent.setup();
    const targetButtonLabel: Category = "어깨";
    renderCategoryFilter();

    await user.click(screen.getByRole("tab", { name: targetButtonLabel }));

    expect(mockOnClick).toHaveBeenCalledWith(targetButtonLabel);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
