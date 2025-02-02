import Providers from "@/providers/Providers";
import { ReactNode } from "react";
import BottomNavBar from "@/components/BottomNavBar/BottomNavBar";

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <Providers>
      <div className="flex flex-col w-full min-h-screen items-center">
        <section className="flex flex-col w-full min-h-screen max-w-[390px] box-border bg-bg-base text-text-white">
          <main className="flex-grow pt-6 px-5">{children}</main>
          <BottomNavBar />
        </section>
      </div>
    </Providers>
  );
};

export default Layout;
