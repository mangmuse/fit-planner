import Providers from "@/providers/Providers";
import { ReactNode } from "react";
import BottomNavBar from "@/components/BottomNavBar/BottomNavBar";

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <Providers>
      <div className="relative flex flex-col w-full h-[100dvh] max-w-[390px] mx-auto bg-bg-base text-text-white">
        <main className="flex-1 overflow-y-auto pt-6 px-5">{children}</main>
        <BottomNavBar />
        <div id="bottom-sheet-portal" />
      </div>
    </Providers>
  );
};

export default Layout;
