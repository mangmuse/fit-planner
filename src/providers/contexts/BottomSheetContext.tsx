"use client";
import BottomSheet from "@/components/Dialog/BottomSheet/BottomSheet";
import { createContext, ReactNode, useContext, useState } from "react";

export type BottomSheetProps = {
  onClose?: () => void;
  children: ReactNode;
  isOpen?: boolean;
  minHeight?: number;
  height?: number | string;
  onExitComplete?: () => void;
  rounded?: boolean;
};

type BottomSheetContextValue = {
  openBottomSheet: (option: BottomSheetProps) => void;
  closeBottomSheet: () => void;
  isOpen: boolean;
};

const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);

export const useBottomSheet = () => {
  const ctx = useContext(BottomSheetContext);
  if (!ctx)
    throw new Error(
      "useBottomSheet 은 BottomSheetProvider 내부에서 사용해야합니다."
    );
  return ctx;
};

export const BottomSheetProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<BottomSheetProps | null>(null);
  const [visible, setVisible] = useState<boolean>(false);

  const openBottomSheet = (option: BottomSheetProps) => {
    setOptions(option);
    setVisible(true);
  };

  const closeBottomSheet = () => {
    setVisible(false);
  };

  return (
    <BottomSheetContext.Provider
      value={{ openBottomSheet, closeBottomSheet, isOpen: visible }}
    >
      {children}
      {options && (
        <BottomSheet
          {...options}
          isOpen={visible}
          onExitComplete={() => {
            // exit 애니메이션 완료 후 options를 제거하여 컴포넌트 언마운트
            setOptions(null);
            options.onExitComplete?.();
          }}
        />
      )}
    </BottomSheetContext.Provider>
  );
};
