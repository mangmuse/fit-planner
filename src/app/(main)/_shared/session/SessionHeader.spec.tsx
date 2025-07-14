import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SessionHeader, { SessionHeaderProps } from "./SessionHeader";

describe("SessionHeader", () => {
  const mockHandleDeleteAll = jest.fn();
  const mockHandleOpenSequenceSheet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSessionHeader = (props?: Partial<SessionHeaderProps>) => {
    const defaultProps: SessionHeaderProps = {
      formattedDate: "12월 1일",
      handleDeleteAll: mockHandleDeleteAll,
      handleOpenSequenceSheet: mockHandleOpenSequenceSheet,
    };
    render(<SessionHeader {...defaultProps} {...props} />);
  };

  describe("렌더링", () => {
    it("formattedDate가 string일 때 time 태그로 렌더링되어야 한다", () => {
      renderSessionHeader({ formattedDate: "12월 1일" });

      const timeElement = screen.getByText("12월 1일");
      expect(timeElement.tagName).toBe("TIME");
    });

    it("formattedDate가 ReactNode일 때 div로 렌더링되어야 한다", () => {
      const customDate = <span>커스텀 날짜</span>;
      renderSessionHeader({ formattedDate: customDate });

      const divElement = screen.getByText("커스텀 날짜").closest("div");
      expect(divElement).toBeInTheDocument();
    });

    it("전체 삭제 버튼이 렌더링되어야 한다", () => {
      renderSessionHeader();

      const deleteButton = screen.getByRole("button", { name: "전체 삭제" });
      expect(deleteButton).toBeInTheDocument();
    });

    it("순서 변경 버튼이 렌더링되어야 한다", () => {
      renderSessionHeader();

      const sequenceButton = screen.getByRole("button", { name: "순서 변경" });
      expect(sequenceButton).toBeInTheDocument();
    });
  });

  describe("상호작용", () => {
    it("전체 삭제 버튼 클릭 시 handleDeleteAll 함수가 호출되어야 한다", async () => {
      renderSessionHeader();

      const deleteButton = screen.getByRole("button", { name: "전체 삭제" });
      await userEvent.click(deleteButton);

      expect(mockHandleDeleteAll).toHaveBeenCalledTimes(1);
    });

    it("순서 변경 버튼 클릭 시 handleOpenSequenceSheet 함수가 호출되어야 한다", async () => {
      renderSessionHeader();

      const sequenceButton = screen.getByRole("button", { name: "순서 변경" });
      await userEvent.click(sequenceButton);

      expect(mockHandleOpenSequenceSheet).toHaveBeenCalledTimes(1);
    });
  });
});
