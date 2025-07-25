"use client";
import { ReactNode } from "react";
import { useModal } from "@/providers/contexts/ModalContext";
import { GenericModalProps } from "@/types/modal.type";

export default function GenericModal({ children }: GenericModalProps) {
  return (
    <div className="bg-bg-secondary p-6 rounded-2xl max-h-[90vh] overflow-y-auto border border-border-gray">
      {children}
    </div>
  );
}
