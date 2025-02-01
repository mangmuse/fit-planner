export interface AlertModalProps {
  type: "alert";
  title?: string;
  message: string;
  onClose?: () => void;
}

export interface ConfirmModalProps {
  type: "confirm";
  title?: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export type ModalProps = AlertModalProps | ConfirmModalProps;
