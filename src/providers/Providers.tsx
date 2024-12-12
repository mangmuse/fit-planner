import { ReactNode } from "react";
import QueryProvider from "./QueryProvider";

function Providers({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

export default Providers;
