import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModalProvider, useModal } from "@/providers/contexts/ModalContext";

const ModalTestConsumer = ({
  onConfirm,
  onCancel,
}: {
  onConfirm?: () => void;
  onCancel?: () => void;
}) => {
  const { openModal } = useModal();

  return (
    <div>
      <button
        onClick={() =>
          openModal({
            type: "confirm",
            title: "테스트 확인",
            message: "정말 실행하시겠습니까?",
            onConfirm,
            onCancel,
          })
        }
      >
        모달 열기
      </button>
    </div>
  );
};

describe("ModalProvider and useModal hook", () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("모달을 열고 확인 버튼을 누르면 onConfirm이 실행되고 모달이 닫힌다", () => {
    render(
      <ModalProvider>
        <ModalTestConsumer onConfirm={mockOnConfirm} />
      </ModalProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "모달 열기" }));

    expect(screen.getByText("테스트 확인")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);

    expect(screen.queryByText("테스트 확인")).not.toBeInTheDocument();
  });

  it("모달을 열고 취소 버튼을 누르면 onCancel이 실행되고 모달이 닫힌다", () => {
    render(
      <ModalProvider>
        <ModalTestConsumer onCancel={mockOnCancel} />
      </ModalProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "모달 열기" }));
    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
    expect(screen.queryByText("테스트 확인")).not.toBeInTheDocument();
  });
});
