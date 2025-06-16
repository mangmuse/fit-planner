"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { ModalProps } from "@/types/modal.type";
import Modal from "@/components/Modal/Modal";

type ModalContextValue = {
  openModal: (options: ModalProps) => void;
  closeModal: () => void;
  isOpen: boolean;
  showError: (message: string) => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx)
    throw new Error("useModal 은 ModalProvider 내부에서 사용해야합니다.");
  return ctx;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalOptions, setModalOptions] = useState<ModalProps | null>(null);

  const openModal = (options: ModalProps) => {
    setModalOptions(options);
  };

  const closeModal = () => {
    setModalOptions(null);
  };
  const showError = (message: string) => {
    openModal({ type: "alert", title: "오류", message });
  };

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        showError,
        isOpen: modalOptions !== null,
      }}
    >
      {children}

      {modalOptions && <Modal {...modalOptions} />}
    </ModalContext.Provider>
  );
}
