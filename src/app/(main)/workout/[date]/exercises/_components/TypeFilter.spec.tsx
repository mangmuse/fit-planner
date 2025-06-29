import TypeFilter, {
  TypeFilterProps,
} from "@/app/(main)/workout/[date]/exercises/_components/TypeFilter";
import { ExerciseType } from "@/types/filters";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("TypeFilter", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderTypeFilter = (overrides: Partial<TypeFilterProps> = {}) => {
    const props: TypeFilterProps = {
      selectedExerciseType: "전체" as ExerciseType,
      onClick: mockOnClick,
      ...overrides,
    };
    return render(<TypeFilter {...props} />);
  };

  it("selectedExerciseType prop과 일치하는 버튼에 aria-selected가 true여야 한다", () => {
    const selectedExerciseType = "커스텀";
    renderTypeFilter({ selectedExerciseType });

    const button = screen.getByRole("tab", { name: selectedExerciseType });
    expect(button).toHaveAttribute("aria-selected", "true");

    const unSelectedButton = screen.getByRole("tab", {
      name: "전체",
    });
    expect(unSelectedButton).toHaveAttribute("aria-selected", "false");

    const unSelectedButton2 = screen.getByRole("tab", {
      name: "즐겨찾기",
    });
    expect(unSelectedButton2).toHaveAttribute("aria-selected", "false");
  });

  it("버튼을 클릭하면 onClick 핸들러가 올바른 값으로 호출되어야 한다", async () => {
    renderTypeFilter();

    const button = screen.getByRole("tab", { name: "커스텀" });
    await userEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledWith("커스텀");
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
