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
  minHeight: minheight,
  isOpen,
  onExitComplete,
  rounded = true,
}: BottomSheetProps) => {
  const { closeBottomSheet } = useBottomSheet();

  const handleClose = () => {
    onClose?.();
    closeBottomSheet();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // 390px 컨테이너의 위치 계산
      const container = document.querySelector('.max-w-\\[390px\\]');
      if (container) {
        const rect = container.getBoundingClientRect();
        document.documentElement.style.setProperty('--container-left', `${rect.left}px`);
        document.documentElement.style.setProperty('--container-width', `${rect.width}px`);
      }
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
            role="presentation"
            className="fixed inset-0 bg-black/30 z-20"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />

          <motion.div
            role="dialog"
            key="bottomsheet"
            className={`fixed overflow-hidden px-3 py-5 bg-bg-surface-variant 
                       ${rounded ? 'rounded-t-3xl' : ''} bottom-0 z-30 flex flex-col
                       left-[var(--container-left,0)] w-[var(--container-width,100%)] max-w-[390px]`}
            style={{ 
              height: height, 
              minHeight: minheight
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.1 }}
          >
            <div className="flex justify-end px-2 mb-2">
              <button onClick={handleClose} aria-label="바텀시트 닫기">
                <Image src={closeBtn} alt="바텀시트 닫기" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
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
