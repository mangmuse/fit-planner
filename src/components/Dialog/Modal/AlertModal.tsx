import { AlertModalProps } from "@/types/modal.type";

const AlertModal = ({ title, message, onClose }: AlertModalProps) => {
  return (
    <div className="bg-bg-secondary px-6 py-6 rounded-2xl max-w-[320px] w-full border border-border-gray" role="dialog">
      <h2 className="text-lg font-semibold text-text-white text-center mb-3">{title || "알림"}</h2>
      <p className="text-text-muted text-center mb-6">{message}</p>
      <button
        onClick={onClose}
        className="w-full py-3 bg-primary text-text-black font-medium rounded-xl hover:bg-primary/90 transition-colors"
      >
        확인
      </button>
    </div>
  );
};

export default AlertModal;
