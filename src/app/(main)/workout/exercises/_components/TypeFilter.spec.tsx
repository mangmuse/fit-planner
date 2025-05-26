import TypeFilter from "@/app/(main)/workout/exercises/_components/TypeFilter";
import { EXERCISETYPELIST } from "@/constants/filters";
import { customRender, screen } from "@/test-utils/test-utils";

describe("TypeFilter", () => {
  const renderTypeFilter = () => {
    const selectedExerciseType = "전체";
    const onClickMock = jest.fn();
    return {
      ...customRender(
        <TypeFilter
          selectedExerciseType={selectedExerciseType}
          onClick={onClickMock}
        />
      ),
      onClickMock,
      selectedExerciseType,
    };
  };
  it("EXERCISETPYELIST 를 기반으로 FilterButton 을 올바르게 렌더링한다", () => {
    const { getByText } = renderTypeFilter();
    EXERCISETYPELIST.forEach((type) =>
      expect(getByText(type)).toBeInTheDocument()
    );
  });
  it("selectedExerciseType과 같으면 true, 다르면 false를 전달한다", () => {
    const { getByText, selectedExerciseType } = renderTypeFilter();

    EXERCISETYPELIST.forEach((type) => {
      const button = getByText(type);
      const attrValue = button.getAttribute("data-is-selected");
      if (type === selectedExerciseType) {
        expect(attrValue).toBe("true");
      } else {
        expect(attrValue).toBe("false");
      }
    });
  });
});
