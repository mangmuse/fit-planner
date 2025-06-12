import CategoryFilter from "@/app/(main)/workout/[date]/exercises/_components/CategoryFilter";
import TypeFilter from "@/app/(main)/workout/[date]/exercises/_components/TypeFilter";
import { CATEGORY_LIST, EXERCISETYPELIST } from "@/constants/filters";
import { customRender, screen } from "@/test-utils/test-utils";

describe("CategoryFilter", () => {
  const renderTypeFilter = () => {
    const selectedCategory = "전체";
    const onClickMock = jest.fn();
    return {
      ...customRender(
        <CategoryFilter
          selectedCategory={selectedCategory}
          onClick={onClickMock}
        />
      ),
      onClickMock,
      selectedCategory,
    };
  };
  it("EXERCISETPYELIST 를 기반으로 FilterButton 을 올바르게 렌더링한다", () => {
    const { getByText } = renderTypeFilter();
    CATEGORY_LIST.forEach((type) =>
      expect(getByText(type)).toBeInTheDocument()
    );
  });
  it("selectedExerciseType과 같으면 true, 다르면 false를 전달한다", () => {
    const { getByText, selectedCategory } = renderTypeFilter();

    CATEGORY_LIST.forEach((type) => {
      const button = getByText(type);
      const attrValue = button.getAttribute("data-is-selected");
      if (type === selectedCategory) {
        expect(attrValue).toBe("true");
      } else {
        expect(attrValue).toBe("false");
      }
    });
  });
});
