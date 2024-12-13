import Providers from "@/providers/Providers";
import { ReactNode } from "react";
import BottomNavBar from "@/components/BottomNavBar/BottomNavBar";
import styles from "./_styles/layout.module.css";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Providers>
      <div className={styles.centerContainer}>
        <section className={styles.mobileContainer}>
          <main className={styles.mainContent}>{children}</main>
          <BottomNavBar />
        </section>
      </div>
    </Providers>
  );
};

export default Layout;
