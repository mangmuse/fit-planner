const openModalMock = jest.fn();
const updateBookmarkMock = jest.fn();

jest.mock("@/providers/contexts/ModalContext", () => ({
  useModal: () => ({
    openModal: openModalMock,
  }),
}));

jest.mock("@/hooks/api/mutation/useExerciseMutation", () => ({
  __esModule: true,
  default: () => ({
    updateBookmark: updateBookmarkMock,
  }),
}));
import { render, screen } from "@testing-library/react";
import ExerciseItem from "./ExerciseItem";
import { ClientExercise } from "@/types/models";
import userEvent from "@testing-library/user-event";
import { mockUserId } from "@/__mocks__/api";

beforeEach(() => {
  openModalMock.mockClear();
  updateBookmarkMock.mockClear();
});

const mockExercise: ClientExercise = {
  id: 1,
  name: "벤치프레스",
  category: "가슴",
  imageUrl: "/",
  isBookmarked: false,
  isCustom: false,
  userId: null,
  createdAt: "2023-12-01T12:00:00.000Z",
};

function renderExerciseItem({
  exercise = mockExercise,
  isSelected = false,
  onAdd = jest.fn(),
  onDelete = jest.fn(),
}: {
  exercise?: ClientExercise;
  isSelected?: boolean;
  onAdd?: jest.Mock;
  onDelete?: jest.Mock;
} = {}) {
  return render(
    <ExerciseItem
      userId={mockUserId}
      exercise={exercise}
      isSelected={isSelected}
      onAdd={onAdd}
      onDelete={onDelete}
    />
  );
}

describe("최초 렌더링", () => {
  it("운동 이름이 올바르게 표시된다", () => {
    renderExerciseItem({});
    expect(screen.getByText("벤치프레스")).toBeInTheDocument();
  });

  it("즐겨찾기 아이콘이 표시된다", () => {
    renderExerciseItem();
    expect(screen.getByAltText("북마크")).toBeInTheDocument();
  });

  it("올바른 스타일링이 적용되어야한다", () => {
    const { container } = renderExerciseItem();
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

describe("bookmark", () => {
  it("북마크가 true일 때 즐겨찾기 아이콘을 클릭시 openModal이 호출된다", async () => {
    renderExerciseItem({ exercise: { ...mockExercise, isBookmarked: true } });

    const bookmarkIcon = screen.getByAltText("북마크 해제");
    await userEvent.click(bookmarkIcon);

    expect(openModalMock).toHaveBeenCalledTimes(1);
    const modalArg = openModalMock.mock.calls[0][0]; // TODO: [0][0] 이해
    modalArg.onConfirm();

    expect(updateBookmarkMock).toHaveBeenCalledTimes(1);
  });

  it("북마크가 false일 때 즐겨찾기 아이콘을 클릭시 updateBookmark가 호출된다", async () => {
    renderExerciseItem();
    const bookmarkIcon = screen.getByAltText("북마크");
    await userEvent.click(bookmarkIcon);
    expect(updateBookmarkMock).toHaveBeenCalledTimes(1);
  });
});

describe("isSelected", () => {
  const onDeleteSpy = jest.fn();
  const onAddSpy = jest.fn();

  it("isSelected가 true라면 텍스트 색상이 text-primary 이다", () => {
    const exerciseItem = renderExerciseItem({ isSelected: true });
    const text = exerciseItem.getByText("벤치프레스");
    expect(text).toHaveClass("text-primary");
  });

  it("isSelected가 false라면 텍스트 색상이 text-primary가 아니다", () => {
    const exerciseItem = renderExerciseItem({ isSelected: false });
    const text = exerciseItem.getByText("벤치프레스");
    expect(text).not.toHaveClass("text-primary");
  });

  it("isSelected가 true일때 아이템을 클릭하면 onDelete 함수가 호출된다", async () => {
    renderExerciseItem({ isSelected: true, onDelete: onDeleteSpy });
    const exerciseItem = screen.getByRole("listitem");
    await userEvent.click(exerciseItem);
    expect(onDeleteSpy).toHaveBeenCalledTimes(1);
  });
  it("isSelected가 false일때 아이템을 클릭하면 onAdd 함수가 호출된다", async () => {
    renderExerciseItem({ isSelected: false, onAdd: onAddSpy });
    const exerciseItem = screen.getByRole("listitem");
    await userEvent.click(exerciseItem);
    expect(onAddSpy).toHaveBeenCalledTimes(1);
  });

  it("즐겨찾기 이미지를 클릭한 경우에는 isSelected가 true이더라도 onDelete함수가 호출되지 않는다", async () => {
    renderExerciseItem({ isSelected: true, onAdd: onAddSpy });
    const bookmarkImage = screen.getByAltText("북마크");
    await userEvent.click(bookmarkImage);
    expect(onDeleteSpy).toHaveBeenCalledTimes(0);
  });
});
