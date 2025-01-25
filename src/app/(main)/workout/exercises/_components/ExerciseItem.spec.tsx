import { render, screen } from "@testing-library/react";
import ExerciseItem from "./ExerciseItem";
import { ClientExerise } from "@/types/models";

describe("ExerciseItem", () => {
  const mockExercise: ClientExerise = {
    id: 1,
    name: "벤치프레스",
    category: "가슴",
    imageUrl: "/",
    isBookmarked: false,
    isCustom: false,
    userId: null,
    createdAt: "2023-12-01T12:00:00.000Z",
  };

  it("운동 이름이 올바르게 표시된다", () => {
    render(<ExerciseItem exercise={mockExercise} />);
    expect(screen.getByText("벤치프레스")).toBeInTheDocument();
  });

  it("즐겨찾기 아이콘이 표시된다", () => {
    render(<ExerciseItem exercise={mockExercise} />);
    expect(screen.getByAltText("즐겨찾기")).toBeInTheDocument();
  });

  it("올바른 스타일링이 적용되어야한다", () => {
    const { container } = render(<ExerciseItem exercise={mockExercise} />);
    const listItem = container.firstChild;
    expect(listItem).toHaveClass(
      "px-3",
      "flex",
      "justify-between",
      "w-full",
      "h-[51px]",
      "rounded-lg",
      "bg-bg-surface"
    );
  });
});
