const openModalMock = jest.fn();

jest.mock("@/providers/contexts/ModalContext", () => ({
  useModal: () => ({
    openModal: openModalMock,
  }),
}));

jest.mock("@/services/exercise.service");
import { mockLocalExercises } from "@/__mocks__/exercise.mock";
import ExerciseItem from "@/app/(main)/workout/[date]/exercises/_components/ExerciseItem";
import { toggleLocalBookmark } from "@/services/exercise.service";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("ExerciseItem", () => {
  const mockExercise = mockLocalExercises[0];
  const renderExerciseItem = (
    isBookmarked: boolean = false,
    isSelected: boolean = false
  ) => {
    const onAddMock = jest.fn();
    const onDeleteMock = jest.fn();
    const onReloadMock = jest.fn();

    const utils = render(
      <ExerciseItem
        exercise={{
          ...mockExercise,
          isBookmarked: isBookmarked,
        }}
        isSelected={isSelected}
        onAdd={onAddMock}
        onDelete={onDeleteMock}
        onReload={onReloadMock}
      />
    );
    return {
      ...utils,
      onAddMock,
      onDeleteMock,
      onReloadMock,
    };
  };

  it("exercise의 name이 올바르게 렌더링된다", async () => {
    const { getByText } = renderExerciseItem();

    expect(getByText(mockExercise.name)).toBeInTheDocument();
  });
  it("isSelected가 true인 경우 name의 색상이 변경된다(test-primary 클래스가 적용된다)", () => {
    const { getByText } = renderExerciseItem(false, true);
    expect(getByText(mockExercise.name)).toHaveClass("text-primary");
  });
  it("isSelected가 false인 경우 name에 test-primary 클래스가 적용되지 않는다", () => {
    const { getByText } = renderExerciseItem();
    expect(getByText(mockExercise.name)).not.toHaveClass("text-primary");
  });
  it("isSelected가 true인 경우 아이템 클릭시 onDelete가 호출된다", async () => {
    const { getByRole, onDeleteMock } = renderExerciseItem(false, true);
    const item = getByRole("listitem");
    await userEvent.click(item);
    expect(onDeleteMock).toHaveBeenCalledWith(mockExercise.id);
  });
  it("isSelected가 false인 경우 아이템 클릭시 onAdd가 호출된다", async () => {
    const { getByRole, onAddMock } = renderExerciseItem();
    const item = getByRole("listitem");
    await userEvent.click(item);
    expect(onAddMock).toHaveBeenCalledWith({
      ...mockExercise,
      isBookmarked: false,
    });
  });
  it("isBookmarked가 true인 경우 북마크 해제 아이콘을 렌더링한다", () => {
    const { getByAltText } = renderExerciseItem(true);
    expect(getByAltText("북마크 해제")).toBeInTheDocument();
  });
  it("isBookmarked가 false인 경우 북마크 아이콘을 클릭하면 toggleLocalBookmark와 onReload가 호출된다", async () => {
    const { getByAltText, onReloadMock } = renderExerciseItem();
    const bookmarkIcon = getByAltText("북마크");
    await userEvent.click(bookmarkIcon);
    expect(toggleLocalBookmark).toHaveBeenCalledWith(mockExercise.id, true);
    expect(onReloadMock).toHaveBeenCalledTimes(1);
  });
  it("isBookmarked가 true인 경우 북마크 해제 아이콘을 클릭하면 openModal이 호출된다", async () => {
    const { getByAltText, onReloadMock } = renderExerciseItem(true);
    const bookmarkIcon = getByAltText("북마크 해제");
    await userEvent.click(bookmarkIcon);
    expect(openModalMock).toHaveBeenCalledTimes(1);
    const { onConfirm } = openModalMock.mock.calls[0][0];
    await onConfirm();

    expect(toggleLocalBookmark).toHaveBeenCalledWith(mockExercise.id, false);
    expect(onReloadMock).toHaveBeenCalledTimes(1);
  });

  it("isBookmarked가 false인 경우 북마크 등록 아이콘을 렌더링한다", () => {
    const { getByAltText } = renderExerciseItem();
    expect(getByAltText("북마크")).toBeInTheDocument();
  });
});
