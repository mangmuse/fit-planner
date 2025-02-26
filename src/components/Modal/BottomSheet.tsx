"use client";

import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import {
  BottomSheetProps,
  useBottomSheet,
} from "@/providers/contexts/BottomSheetContext";
import { useEffect } from "react";

const BottomSheet = ({
  children,
  onClose,
  height,
  isOpen,
  onExitComplete,
}: BottomSheetProps) => {
  const { closeBottomSheet } = useBottomSheet();

  const handleClose = () => {
    onClose?.();
    closeBottomSheet();
  };

  // isOpen이 true로 변경되는 시점에 body 스크롤을 막아준다
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
  }, [isOpen]);

  const content = (
    <AnimatePresence
      // exit 애니메이션이 완전히 끝난 시점에 스크롤을 풀어준다.
      onExitComplete={() => {
        document.body.style.overflow = "";
        onExitComplete?.();
      }}
    >
      {isOpen && (
        <>
          <motion.div
            className="absolute inset-0 bg-black/30 z-40"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />

          <motion.div
            key="bottomsheet"
            className="absolute py-5 bg-bg-surface-variant 
                       rounded-t-3xl bottom-0 left-0 w-full z-50"
            style={{ height }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.1 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const portalContainer = document.getElementById("bottom-sheet-portal");
  return portalContainer
    ? ReactDOM.createPortal(content, portalContainer)
    : null;
};

export default BottomSheet;
