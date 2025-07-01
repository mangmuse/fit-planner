import ExerciseMemoTab from "@/app/(main)/_shared/session/exerciseMemo/ExerciseMemoTab";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("ExerciseMemoTab", () => {
  const mockOnSelect = jest.fn();
  describe("렌더링", () => {
    it("activeTab이 fixed인 경우 고정 메모 탭이 활성화되어 있어야 한다", () => {
      render(<ExerciseMemoTab activeTab="fixed" onSelect={mockOnSelect} />);

      expect(screen.getByRole("tab", { name: "고정 메모" })).toHaveAttribute(
        "aria-selected",
        "true"
      );

      expect(screen.getByRole("tab", { name: "날짜별 메모" })).toHaveAttribute(
        "aria-selected",
        "false"
      );
    });

    it("activeTab이 today인 경우 날짜별 메모 탭이 활성화되어 있어야 한다", () => {
      render(<ExerciseMemoTab activeTab="today" onSelect={mockOnSelect} />);

      expect(screen.getByRole("tab", { name: "고정 메모" })).toHaveAttribute(
        "aria-selected",
        "false"
      );

      expect(screen.getByRole("tab", { name: "날짜별 메모" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
  });

  describe("상호작용", () => {
    it("비활성화된 탭을 클릭하면 onSelect가 호출되어야 한다", async () => {
      render(<ExerciseMemoTab activeTab="fixed" onSelect={mockOnSelect} />);

      await userEvent.click(screen.getByRole("tab", { name: "날짜별 메모" }));

      expect(mockOnSelect).toHaveBeenCalledWith("today");
    });

    it("이미 활성화된 탭을 클릭해도 onSelect가 호출되어야 한다", async () => {
      render(<ExerciseMemoTab activeTab="fixed" onSelect={mockOnSelect} />);

      await userEvent.click(screen.getByRole("tab", { name: "고정 메모" }));

      expect(mockOnSelect).toHaveBeenCalledWith("fixed");
    });
  });
});
