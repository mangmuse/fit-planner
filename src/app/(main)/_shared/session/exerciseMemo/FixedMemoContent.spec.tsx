import FixedMemoContent from "@/app/(main)/_shared/session/exerciseMemo/FixedMemoContent";
import { LocalExercise } from "@/types/models";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockFixedMemo: NonNullable<LocalExercise["exerciseMemo"]>["fixed"] = {
  content: "테스트메모",
  createdAt: new Date("2025-01-01").toISOString(),
  updatedAt: new Date("2025-02-01").toISOString(),
};

describe("FixedMemoContent", () => {
  const mockOnChange = jest.fn();

  describe("렌더링", () => {
    it("fixedMemo의 마지막 수정일을 표시해야 한다", () => {
      render(
        <FixedMemoContent
          fixedMemo={mockFixedMemo}
          memoText="새로운 메모"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText("마지막 수정일 2025-02-01")).toBeInTheDocument();
    });

    it("updatedAt이 없는경우 createdAt을 표시해야 한다", () => {
      render(
        <FixedMemoContent
          fixedMemo={{ ...mockFixedMemo, updatedAt: null }}
          memoText="새로운 메모"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText("마지막 수정일 2025-01-01")).toBeInTheDocument();
    });

    it("textarea는 전달받은 memoText를 표시한다", () => {
      render(
        <FixedMemoContent
          fixedMemo={mockFixedMemo}
          memoText="새로운 메모"
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("새로운 메모");
    });

    it("fixedMemo가 없는 경우에도 올바르게 렌더링되어야 한다", () => {
      render(
        <FixedMemoContent
          fixedMemo={null}
          memoText="새로운 메모"
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("새로운 메모");
    });
  });

  describe("상호작용", () => {
    it("textarea의 값이 변경되면 onChange가 호출되어야 한다", async () => {
      render(
        <FixedMemoContent
          fixedMemo={mockFixedMemo}
          memoText="새로운 메모"
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByRole("textbox");

      await userEvent.clear(textarea);
      await userEvent.type(textarea, "새로운 메모");

      expect(mockOnChange).toHaveBeenCalledTimes(7);
      expect(textarea).toHaveValue("새로운 메모");
    });
  });
});
