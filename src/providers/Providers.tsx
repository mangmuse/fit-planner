import { ReactNode } from "react";
import QueryProvider from "./QueryProvider";
import { ModalProvider } from "@/providers/contexts/ModalContext";
import SessionProviderWrapper from "@/providers/SessionProviderWrapper";
import { BottomSheetProvider } from "@/providers/contexts/BottomSheetContext";

function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <SessionProviderWrapper>
        <ModalProvider>
          <BottomSheetProvider>{children}</BottomSheetProvider>
        </ModalProvider>
      </SessionProviderWrapper>
    </QueryProvider>
  );
}

export default Providers;
