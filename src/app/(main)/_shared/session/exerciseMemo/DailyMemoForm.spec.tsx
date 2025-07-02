import DailyMemoForm, {
  DailyMemoFormProps,
} from "@/app/(main)/_shared/session/exerciseMemo/DailyMemoForm";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("DailyMemoForm", () => {
  const mockOnAddMemo = jest.fn();
  const mockSetIsWritingNew = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderDailyMemoForm = (props?: Partial<DailyMemoFormProps>) => {
    render(
      <DailyMemoForm
        onAddMemo={mockOnAddMemo}
        setIsWritingNew={mockSetIsWritingNew}
        {...props}
      />
    );
  };

  describe("렌더링", () => {
    it("textarea가 비어있어야 한다", () => {
      renderDailyMemoForm();

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute(
        "placeholder",
        "오늘의 특이사항을 기록하세요"
      );
      expect(textarea).toHaveValue("");
    });
  });

  describe("상호작용", () => {
    const user = userEvent.setup();

    it("textarea가 비어있거나 공백만 있으면 저장 버튼은 비활성화 되어야 한다", async () => {
      renderDailyMemoForm();

      const saveButton = screen.getByRole("button", { name: "저장" });
      expect(saveButton).toBeDisabled();

      await user.type(screen.getByRole("textbox"), "     ");
      expect(saveButton).toBeDisabled();
    });

    it("textarea의 값이 있을때 저장버튼을 클릭하면 onAddMemo가 호출되어야 한다", async () => {
      renderDailyMemoForm();

      const saveButton = screen.getByRole("button", { name: "저장" });
      await user.type(screen.getByRole("textbox"), "테스트 메모");
      await user.click(saveButton);

      expect(mockOnAddMemo).toHaveBeenCalledWith("테스트 메모");
      expect(screen.getByRole("textbox")).toHaveValue("");
    });

    it("빈 값이나 공백만 있을 때는 onAddMemo가 호출되지 않아야 한다", async () => {
      renderDailyMemoForm();

      const saveButton = screen.getByRole("button", { name: "저장" });

      await user.click(saveButton);
      expect(mockOnAddMemo).not.toHaveBeenCalled();

      await user.type(screen.getByRole("textbox"), "   ");
      await user.click(saveButton);
      expect(mockOnAddMemo).not.toHaveBeenCalled();
    });

    it("취소 버튼을 클릭하면 메모 작성이 취소되어야 한다", async () => {
      renderDailyMemoForm();

      const cancelButton = screen.getByRole("button", { name: "취소" });
      await user.type(screen.getByRole("textbox"), "test");
      await user.click(cancelButton);

      expect(mockSetIsWritingNew).toHaveBeenCalledWith(false);
      expect(screen.getByRole("textbox")).toHaveValue("");
    });
  });
});
