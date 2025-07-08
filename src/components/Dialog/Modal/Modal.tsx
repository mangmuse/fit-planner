"use client";
import AlertModal from "@/components/Dialog/Modal/AlertModal";
import ConfirmModal from "@/components/Dialog/Modal/ConfirmModal";
import GenericModal from "@/components/Dialog/Modal/GenericModal";
import { useModal } from "@/providers/contexts/ModalContext";
import {
  ModalProps,
  AlertModalProps,
  ConfirmModalProps,
} from "@/types/modal.type";

function BackDrop({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClick}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
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
        const { children, onClose, disableBackdropClick } = props;
        return <GenericModal type="generic" onClose={onClose} disableBackdropClick={disableBackdropClick}>{children}</GenericModal>;
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

  const handleBackdropClick = () => {
    if (props.type === "generic") {
      const { onClose, disableBackdropClick } = props;
      if (!disableBackdropClick) {
        onClose?.();
        closeModal();
      }
    } else if (props.type === "confirm") {
      handleCancel();
    } else if (props.type === "alert") {
      handleAlertClose();
    }
  };

  return <BackDrop onClick={handleBackdropClick}>{renderModalContent()}</BackDrop>;
}
