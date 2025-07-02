import AddMemoButton from "@/app/(main)/_shared/session/exerciseMemo/AddMemoButton";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("AddMemoButton", () => {
  describe("렌더링", () => {
    it("오늘 메모 작성 버튼이 오늘 날짜를 표시해야 한다", () => {
      render(<AddMemoButton setIsWritingNew={jest.fn()} today="2025-01-01" />);

      const button = screen.getByRole("button", {
        name: "+ 오늘 메모 작성 2025-01-01",
      });
      expect(button).toBeInTheDocument();
    });
  });

  describe("상호작용", () => {
    const mockSetIsWritingNew = jest.fn();
    it("버튼을 클릭하면 setIsWritingNew가 true로 호출되어야 한다", async () => {
      render(
        <AddMemoButton
          setIsWritingNew={mockSetIsWritingNew}
          today="2025-01-01"
        />
      );
      await userEvent.click(
        screen.getByRole("button", { name: "+ 오늘 메모 작성 2025-01-01" })
      );

      expect(mockSetIsWritingNew).toHaveBeenCalledWith(true);
    });
  });
});
