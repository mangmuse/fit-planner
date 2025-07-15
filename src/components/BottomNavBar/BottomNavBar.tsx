"use client";

import { usePathname } from "next/navigation";
import { Home, Folder, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import BottomNavBarItem from "./BottomNavBarItem";
type NavBarItem = "home" | "routines" | "settings";

const BottomNavBar = () => {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState<NavBarItem>("home");
  useEffect(() => {
    const currentPathname = pathname.slice(1) as NavBarItem;
    setCurrentPage(currentPathname);
  }, [pathname]);

  if (!["/home", "/routines", "/settings"].includes(pathname)) {
    return null;
  }

  return (
    <nav className="bottom-0 w-full h-[52px] bg-bg-base text-text-muted flex justify-around items-center">
      <BottomNavBarItem
        path="/"
        icon={Home}
        label="홈"
        isActive={currentPage === "home"}
      />
      <BottomNavBarItem
        path="/routines"
        icon={Folder}
        label="루틴"
        isActive={currentPage === "routines"}
      />
      <BottomNavBarItem
        path="/settings"
        icon={Settings}
        label="설정"
        isActive={currentPage === "settings"}
      />
    </nav>
  );
};

export default BottomNavBar;
