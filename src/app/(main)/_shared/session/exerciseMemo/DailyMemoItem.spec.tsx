import DailyMemoItem from "@/app/(main)/_shared/session/exerciseMemo/DailyMemoItem";
import { render, screen } from "@testing-library/react";

describe("DailyMemoItem", () => {
  const mockMemo = {
    date: "2025-01-15",
    content: "테스트 메모",
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: null,
  };

  describe("렌더링", () => {
    it("메모 날짜와 내용이 표시되어야 한다", () => {
      render(<DailyMemoItem memo={mockMemo} isToday={false} />);

      expect(screen.getByText("2025-01-15")).toBeInTheDocument();
      expect(screen.getByText("테스트 메모")).toBeInTheDocument();
    });

    it("오늘 날짜인 경우 날짜 옆에 (오늘) 표시가 함께 나타나야 한다", () => {
      render(<DailyMemoItem memo={mockMemo} isToday={true} />);

      const dateElement = screen.getByText("2025-01-15");
      expect(dateElement.parentElement).toHaveTextContent("2025-01-15(오늘)");
    });

    it("오늘 날짜가 아닌 경우 (오늘) 표시가 없어야 한다", () => {
      render(<DailyMemoItem memo={mockMemo} isToday={false} />);

      const dateElement = screen.getByText("2025-01-15");
      expect(dateElement.parentElement).toHaveTextContent("2025-01-15");
      expect(dateElement.parentElement).not.toHaveTextContent("(오늘)");
    });
  });
});
