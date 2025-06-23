import { ReactNode } from "react";
import QueryProvider from "./QueryProvider";
import { ModalProvider } from "@/providers/contexts/ModalContext";
import SessionProviderWrapper from "@/providers/SessionProviderWrapper";
import { BottomSheetProvider } from "@/providers/contexts/BottomSheetContext";
import ErrorBoundaryProvider from "@/providers/ErrorBoundaryProvider";

function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundaryProvider>
      <QueryProvider>
        <SessionProviderWrapper>
          <ModalProvider>
            <BottomSheetProvider>{children}</BottomSheetProvider>
          </ModalProvider>
        </SessionProviderWrapper>
      </QueryProvider>
    </ErrorBoundaryProvider>
  );
}

export default Providers;
