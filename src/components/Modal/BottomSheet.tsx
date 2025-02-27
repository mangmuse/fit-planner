"use client";

import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import {
  BottomSheetProps,
  useBottomSheet,
} from "@/providers/contexts/BottomSheetContext";
import { useEffect } from "react";
import closeBtn from "public/closeBtn.svg";
import Image from "next/image";

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
  }, [isOpen]);

  const content = (
    <AnimatePresence
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
            className="absolute px-3 py-5 bg-bg-surface-variant 
                       rounded-t-3xl bottom-0 left-0 w-full z-50"
            style={{ minHeight: height }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.1 }}
          >
            <div className="flex justify-end px-2">
              <button onClick={handleClose}>
                <Image src={closeBtn} alt="바텀시트 닫기" />
              </button>
            </div>
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
