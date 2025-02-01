import { AlertModalProps } from "@/types/modal.type";

const AlertModal = ({ title, message, onClose }: AlertModalProps) => {
  return (
    <>
      <h2 className="font-bold mb-2">{title || "알림"}</h2>
      <p>{message}</p>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          확인
        </button>
      </div>
    </>
  );
};

export default AlertModal;
