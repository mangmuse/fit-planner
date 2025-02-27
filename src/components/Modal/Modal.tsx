"use client";
import AlertModal from "@/components/Modal/AlertModal";
import ConfirmModal from "@/components/Modal/ConfirmModal";
import GenericModal from "@/components/Modal/GenericModal";
import { useModal } from "@/providers/contexts/ModalContext";
import {
  ModalProps,
  AlertModalProps,
  ConfirmModalProps,
} from "@/types/modal.type";

function BackDrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="p-6 rounded">{children}</div>
    </div>
  );
}

export default function Modal(props: ModalProps) {
  const { closeModal } = useModal();

  const handleAlertClose = () => {
    (props as AlertModalProps).onClose?.();
    closeModal();
  };

  const handleConfirm = () => {
    (props as ConfirmModalProps).onConfirm?.();
    closeModal();
  };

  const handleCancel = () => {
    (props as ConfirmModalProps).onCancel?.();
    closeModal();
  };

  const renderModalContent = () => {
    switch (props.type) {
      case "generic": {
        const { children, onClose } = props;
        return <GenericModal type="generic">{children}</GenericModal>;
      }
      case "alert": {
        const { title, message } = props;
        return (
          <AlertModal
            type="alert"
            message={message}
            title={title}
            onClose={handleAlertClose}
          />
        );
      }
      case "confirm": {
        const { title, message } = props;
        return (
          <ConfirmModal
            type="confirm"
            message={message}
            title={title}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        );
      }
      default:
        return null;
    }
  };

  return <BackDrop>{renderModalContent()}</BackDrop>;
}
