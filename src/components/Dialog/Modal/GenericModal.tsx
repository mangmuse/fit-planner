"use client";
import { ReactNode } from "react";
import { useModal } from "@/providers/contexts/ModalContext";
import { GenericModalProps } from "@/types/modal.type";

export default function GenericModal({ children, onClose }: GenericModalProps) {
  const { closeModal } = useModal();

  const handleClose = () => {
    onClose?.();
    closeModal();
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 bg-black/30 flex justify-center items-center"
    >
      <div
        className="bg-bg-secondary p-6 rounded-2xl max-h-[90vh] overflow-y-auto border border-border-gray"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
