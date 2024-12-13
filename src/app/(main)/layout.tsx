import Providers from "@/providers/Providers";
import { ReactNode } from "react";
import {
  centerContainer,
  mainContent,
  mobileContainer,
} from "@/app/(main)/_styles/layout.css";
import BottomNavBar from "@/components/BottomNavBar/BottomNavBar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Providers>
      <div className={centerContainer}>
        <section className={mobileContainer}>
          <main className={mainContent}>{children}</main>
          <BottomNavBar />
        </section>
      </div>
    </Providers>
  );
};

export default Layout;
