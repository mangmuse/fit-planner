import { ReactNode } from "react";
import QueryProvider from "./QueryProvider";
import { ModalProvider } from "@/providers/contexts/ModalContext";
import SessionProviderWrapper from "@/providers/SessionProviderWrapper";
import { BottomSheetProvider } from "@/providers/contexts/BottomSheetContext";

function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <SessionProviderWrapper>
        <BottomSheetProvider>
          <ModalProvider>{children}</ModalProvider>
        </BottomSheetProvider>
      </SessionProviderWrapper>
    </QueryProvider>
  );
}

export default Providers;
