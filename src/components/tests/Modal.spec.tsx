import Modal from "@/components/Modal/Modal";
import { ConfirmModalProps } from "@/types/modal.type";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const closeModalMock = jest.fn();
jest.mock("@/providers/contexts/ModalContext", () => ({
  useModal: () => ({
    closeModal: closeModalMock,
  }),
}));

const props: ConfirmModalProps = {
  type: "confirm",
  title: "정말로 삭제하시겠습니까?",
  message: "이 동작은 되돌릴 수 없습니다.",
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

describe("confirm", () => {
  it("type='confirm' 인 경우 ConfirmModal이 렌더링되며 확인/취소 버튼이 보여진다", () => {
    render(<Modal {...props} />);
    const title = screen.getByText("정말로 삭제하시겠습니까?");
    const message = screen.getByText("이 동작은 되돌릴 수 없습니다.");
    expect(title).toBeInTheDocument();
    expect(message).toBeInTheDocument();
  });
  it("취소 버튼 클릭 시 onCancel 과 closeModal 이 호출된다", async () => {
    const onCancelMock = jest.fn();
    render(<Modal {...props} onCancel={onCancelMock} />);
    const cancelButton = screen.getByText("취소");
    await userEvent.click(cancelButton);
    expect(onCancelMock).toHaveBeenCalledTimes(1);
    expect(closeModalMock).toHaveBeenCalledTimes(1);
  });

  it("확인 버튼 클릭 시 onConfirm과 closeModal이 호출된다", async () => {
    const onConfirmMock = jest.fn();
    render(<Modal {...props} onConfirm={onConfirmMock} />);
    const confirmButton = screen.getByText("확인");
    await userEvent.click(confirmButton);
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
    expect(closeModalMock).toHaveBeenCalledTimes(1);
  });
});
