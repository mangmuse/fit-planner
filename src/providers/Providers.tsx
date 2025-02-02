import { ReactNode } from "react";
import QueryProvider from "./QueryProvider";
import { ModalProvider } from "@/providers/contexts/ModalContext";
import SessionProviderWrapper from "@/providers/SessionProviderWrapper";

function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <SessionProviderWrapper>
        <ModalProvider>{children}</ModalProvider>
      </SessionProviderWrapper>
    </QueryProvider>
  );
}

export default Providers;
