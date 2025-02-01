import { ReactNode } from "react";
import QueryProvider from "./QueryProvider";
import { ModalProvider } from "@/providers/contexts/ModalContext";

function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ModalProvider>{children}</ModalProvider>
    </QueryProvider>
  );
}

export default Providers;
