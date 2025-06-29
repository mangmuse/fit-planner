import { mockExercise } from "@/__mocks__/exercise.mock";
import { ExerciseItemProps } from "@/app/(main)/workout/[date]/exercises/_components/ExerciseItem";
import ExerciseList from "@/app/(main)/workout/[date]/exercises/_components/ExerciseList";
import { LocalExercise } from "@/types/models";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock(
  "@/app/(main)/workout/[date]/exercises/_components/ExerciseItem",
  () => {
    return function MockExerciseItem({
      exercise,
      onAdd,
      onDelete,
      onReload,
      isSelected,
    }: ExerciseItemProps) {
      return (
        <li
          data-testid={`exercise-item-${exercise.id}`}
          data-is-selected={isSelected}
        >
          <span>{exercise.name}</span>
          <button onClick={() => onAdd(exercise)}>추가</button>
          <button onClick={() => onDelete(exercise.id!)}>삭제</button>
          <button onClick={() => onReload()}>새로고침</button>
        </li>
      );
    };
  }
);

const mockExerciseList = [
  { ...mockExercise.bookmarked, id: 1, name: "벤치프레스" },
  { ...mockExercise.bookmarked, id: 2, name: "스쿼트" },
];

type ExerciseListProps = {
  exercises: LocalExercise[];
  selectedExercises: { id: number; name: string }[];
  onAdd: jest.Mock;
  onDelete: jest.Mock;
  onReload: jest.Mock;
};

describe("ExerciseList", () => {
  const mockOnAdd = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnReload = jest.fn();

  const renderExerciseList = (overrides: Partial<ExerciseListProps> = {}) => {
    const props: ExerciseListProps = {
      exercises: mockExerciseList,
      selectedExercises: [],
      onAdd: mockOnAdd,
      onDelete: mockOnDelete,
      onReload: mockOnReload,
      ...overrides,
    };

    return render(<ExerciseList {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exercises 배열의 모든 항목을 렌더링해야 한다", () => {
    renderExerciseList();

    expect(screen.getByText("벤치프레스")).toBeInTheDocument();
    expect(screen.getByText("스쿼트")).toBeInTheDocument();
  });

  it("선택된 운동 항목에 isSelected prop으로 true를 전달해야한다", () => {
    renderExerciseList({
      selectedExercises: [{ id: 1, name: "벤치프레스" }],
    });

    expect(screen.getByTestId("exercise-item-1")).toHaveAttribute(
      "data-is-selected",
      "true"
    );

    expect(screen.getByTestId("exercise-item-2")).toHaveAttribute(
      "data-is-selected",
      "false"
    );
  });

  it("선택되지 않은 운동 항목에는 isSelected prop으로 false를 전달해야한다", () => {
    renderExerciseList();

    expect(screen.getByTestId("exercise-item-1")).toHaveAttribute(
      "data-is-selected",
      "false"
    );
    expect(screen.getByTestId("exercise-item-2")).toHaveAttribute(
      "data-is-selected",
      "false"
    );
  });

  it("onAdd prop을 올바르게 자식에게 전달하고 자식의 이벤트에 의해 호출되어야 한다", async () => {
    renderExerciseList();

    const firstItem = screen.getByTestId("exercise-item-1");
    await userEvent.click(within(firstItem).getByText("추가"));

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    expect(mockOnAdd).toHaveBeenCalledWith(mockExerciseList[0]);
  });

  it("onDelete prop을 올바르게 자식에게 전달하고 자식의 이벤트에 의해 호출되어야 한다", async () => {
    renderExerciseList();

    const firstItem = screen.getByTestId("exercise-item-1");
    await userEvent.click(within(firstItem).getByText("삭제"));

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockExerciseList[0].id);
  });

  it("onReload prop을 올바르게 자식에게 전달하고 자식의 이벤트에 의해 호출되어야 한다", async () => {
    renderExerciseList();

    const firstItem = screen.getByTestId("exercise-item-1");
    await userEvent.click(within(firstItem).getByText("새로고침"));

    expect(mockOnReload).toHaveBeenCalledTimes(1);
  });
});
