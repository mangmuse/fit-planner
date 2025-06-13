import { ConfirmModalProps } from "@/types/modal.type";

const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <div className="bg-bg-secondary px-6 py-6 rounded-2xl max-w-[320px] w-full border border-border-gray" role="dialog">
      <h2 className="text-lg font-semibold text-text-white text-center mb-3">{title || "확인"}</h2>
      <p className="text-text-muted text-center mb-6">{message}</p>
      <div className="flex gap-3">
        <button 
          onClick={onCancel} 
          className="flex-1 py-3 bg-bg-surface text-text-white font-medium rounded-xl hover:bg-bg-surface-variant transition-colors"
        >
          취소
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 bg-primary text-text-black font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
