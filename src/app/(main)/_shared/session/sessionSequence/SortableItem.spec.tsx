import SortableItem from "@/app/(main)/_shared/session/sessionSequence/SortableItem";
import { useSortable } from "@dnd-kit/sortable";
import { render, screen } from "@testing-library/react";
import { mockUseSortableReturn } from "@/__mocks__/@dnd-kit/sortable";

jest.mock("@dnd-kit/sortable");

const mockedUseSortable = jest.mocked(useSortable);

describe("SortableItem", () => {
  const defaultProps = {
    id: "test-id",
    value: "테스트 아이템",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSortableReturn.isDragging = false;
  });

  it("value prop이 올바르게 표시된다", () => {
    render(<SortableItem {...defaultProps} />);

    expect(screen.getByText("테스트 아이템")).toBeInTheDocument();
  });

  it("useSortable 훅에 올바른 id를 전달한다", () => {
    render(<SortableItem {...defaultProps} />);

    expect(mockedUseSortable).toHaveBeenCalledWith({ id: "test-id" });
  });

  it("드래그 상태가 아닐 때 data-dragging이 false로 설정된다", () => {
    render(<SortableItem {...defaultProps} />);

    const listItem = screen.getByRole("listitem");
    expect(listItem).toHaveAttribute("data-dragging", "false");
  });

  it("드래그 중일 때 data-dragging이 true로 설정된다", () => {
    mockUseSortableReturn.isDragging = true;

    render(<SortableItem {...defaultProps} />);

    const listItem = screen.getByRole("listitem");
    expect(listItem).toHaveAttribute("data-dragging", "true");
  });
});
