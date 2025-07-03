import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModalProvider, useModal } from "@/providers/contexts/ModalContext";

const ModalTestConsumer = ({
  onConfirm,
  onCancel,
  onAlertClose,
}: {
  onConfirm?: () => void;
  onCancel?: () => void;
  onAlertClose?: () => void;
}) => {
  const { openModal, isOpen } = useModal();

  return (
    <div data-testid={isOpen.toString()}>
      <button
        onClick={() =>
          openModal({
            type: "confirm",
            title: "확인 모달",
            message: "실행할까요?",
            onConfirm,
            onCancel,
          })
        }
      >
        확인 모달 열기
      </button>

      <button
        onClick={() =>
          openModal({
            type: "alert",
            title: "알림 모달",
            message: "완료됐어요",
            onClose: onAlertClose,
          })
        }
      >
        알림 모달 열기
      </button>

      <button
        onClick={() =>
          openModal({
            type: "generic",
            children: (
              <div>
                <h3>일반 모달</h3>
                <p>커스텀 내용</p>
                <button>커스텀 버튼</button>
              </div>
            ),
          })
        }
      >
        일반 모달 열기
      </button>
    </div>
  );
};

describe("ModalProvider and useModal hook", () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnAlertClose = jest.fn();
  const user = userEvent.setup();

  const renderModalProvider = (overrides?: {
    onConfirm?: () => void;
    onCancel?: () => void;
    onAlertClose?: () => void;
  }) => {
    const defaultProps = {
      onConfirm: mockOnConfirm,
      onCancel: mockOnCancel,
      onAlertClose: mockOnAlertClose,
      ...overrides,
    };

    return render(
      <ModalProvider>
        <ModalTestConsumer {...defaultProps} />
      </ModalProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Confirm Modal", () => {
    it("확인 버튼을 누르면 onConfirm이 실행되고 모달이 닫혀야 한다", async () => {
      renderModalProvider();

      expect(screen.getByTestId("false")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "확인 모달 열기" }));

      expect(screen.getByText("확인 모달")).toBeInTheDocument();
      expect(screen.getByTestId("true")).toBeInTheDocument();

      const confirmButton = screen.getByRole("button", { name: "확인" });
      const cancelButton = screen.getByRole("button", { name: "취소" });

      expect(confirmButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();

      await user.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("확인 모달")).not.toBeInTheDocument();
      expect(screen.getByTestId("false")).toBeInTheDocument();
    });

    it("취소 버튼을 누르면 onCancel이 실행되고 모달이 닫혀야 한다", async () => {
      renderModalProvider();

      expect(screen.getByTestId("false")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "확인 모달 열기" }));

      expect(screen.getByText("확인 모달")).toBeInTheDocument();
      expect(screen.getByTestId("true")).toBeInTheDocument();

      const confirmButton = screen.getByRole("button", { name: "확인" });
      const cancelButton = screen.getByRole("button", { name: "취소" });

      expect(confirmButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();

      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
      expect(screen.queryByText("확인 모달")).not.toBeInTheDocument();
      expect(screen.getByTestId("false")).toBeInTheDocument();
    });
  });

  describe("Alert Modal", () => {
    it("확인 버튼만 있어야 하고 클릭 시 onClose가 실행되어야 한다", async () => {
      renderModalProvider();

      await user.click(screen.getByRole("button", { name: "알림 모달 열기" }));

      expect(screen.getByText("알림 모달")).toBeInTheDocument();
      expect(screen.getByText("완료됐어요")).toBeInTheDocument();
      expect(screen.getByTestId("true")).toBeInTheDocument();

      const confirmButton = screen.getByRole("button", { name: "확인" });
      expect(confirmButton).toBeInTheDocument();

      expect(
        screen.queryByRole("button", { name: "취소" })
      ).not.toBeInTheDocument();

      await user.click(confirmButton);

      expect(mockOnAlertClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("알림 모달")).not.toBeInTheDocument();
      expect(screen.getByTestId("false")).toBeInTheDocument();
    });
  });

  describe("Generic Modal", () => {
    it("커스텀 컨텐츠와 함께 렌더링되어야 한다", async () => {
      renderModalProvider();

      await user.click(screen.getByRole("button", { name: "일반 모달 열기" }));

      expect(screen.getByText("일반 모달")).toBeInTheDocument();
      expect(screen.getByText("커스텀 내용")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "커스텀 버튼" })
      ).toBeInTheDocument();

      expect(screen.getByTestId("true")).toBeInTheDocument();
    });
  });

  describe("Hook Functions", () => {
    it("showError 함수가 에러 알림 모달을 열어야 한다", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ModalProvider>{children}</ModalProvider>
      );

      const { result } = renderHook(() => useModal(), { wrapper });

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.showError("테스트 에러");
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("closeModal 함수가 모달을 닫아야 한다", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ModalProvider>{children}</ModalProvider>
      );

      const { result } = renderHook(() => useModal(), { wrapper });

      act(() => {
        result.current.openModal({
          type: "alert",
          title: "테스트",
          message: "테스트",
        });
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("브라우저 뒤로가기 이벤트", () => {
    it("뒤로가기 시 모달이 닫혀야 한다", async () => {
      renderModalProvider();

      expect(screen.getByTestId("false")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "확인 모달 열기" }));

      expect(screen.getByTestId("true")).toBeInTheDocument();
      expect(screen.getByText("확인 모달")).toBeInTheDocument();

      fireEvent.popState(window);

      expect(screen.getByTestId("false")).toBeInTheDocument();
      expect(screen.queryByText("확인 모달")).not.toBeInTheDocument();
    });

    it("모달이 닫힌 상태에서 뒤로가기해도 문제없어야 한다", () => {
      renderModalProvider();

      expect(screen.getByTestId("false")).toBeInTheDocument();

      fireEvent.popState(window);

      expect(screen.getByTestId("false")).toBeInTheDocument();
    });
  });
});
