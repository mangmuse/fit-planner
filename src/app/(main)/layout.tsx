import Providers from "@/providers/Providers";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return <Providers>{children}</Providers>;
};

export default Layout;
