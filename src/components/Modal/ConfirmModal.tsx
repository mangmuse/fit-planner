import { ConfirmModalProps } from "@/types/modal.type";

const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <>
      <h2 className="font-bold mb-2">{title || "확인"}</h2>
      <p>{message}</p>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">
          취소
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          확인
        </button>
      </div>
    </>
  );
};

export default ConfirmModal;
