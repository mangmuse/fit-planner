import Providers from "@/providers/Providers";
import { ReactNode } from "react";
import { centerContainer, mobileContainer } from "./styles/layout.css";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Providers>
      <div className={centerContainer}>
        <section className={mobileContainer}>{children}</section>
      </div>
    </Providers>
  );
};

export default Layout;
