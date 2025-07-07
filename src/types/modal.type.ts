import { ReactNode } from "react";

export type GenericModalProps = {
  type: "generic";
  children: ReactNode;
  onClose?: () => void;
  disableBackdropClick?: boolean;
};

export type AlertModalProps = {
  type?: "alert";
  title?: string;
  message: string;
  onClose?: () => void;
};

export type ConfirmModalProps = {
  type?: "confirm";
  title?: string;
  message: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
};

export type ModalProps =
  | AlertModalProps
  | ConfirmModalProps
  | GenericModalProps;
