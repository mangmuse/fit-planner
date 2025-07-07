"use client";

import { usePathname } from "next/navigation";
import home from "public/bottom-navbar/home.svg";
import routine from "public/bottom-navbar/routine.svg";
import analytics from "public/bottom-navbar/analytics.svg";
import settings from "public/bottom-navbar/settings.svg";
import activeHome from "public/bottom-navbar/active_home.svg";
import activeRoutine from "public/bottom-navbar/active_routine.svg";
import activeAnalytics from "public/bottom-navbar/active_analytics.svg";
import activeSettings from "public/bottom-navbar/active_settings.svg";
import { useEffect, useState } from "react";
import BottomNavBarItem from "./BottomNavBarItem";
type NavBarItem = "home" | "routines" | "analytics" | "settings";

const BottomNavBar = () => {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState<NavBarItem>("home");
  useEffect(() => {
    const currentPathname = pathname.slice(1) as NavBarItem;
    setCurrentPage(currentPathname);
  }, [pathname]);

  if (!["/home", "/routines", "/analytics", "/settings"].includes(pathname)) {
    return null;
  }

  return (
    <nav className="bottom-0 w-full h-[52px] bg-bg-base text-text-muted flex justify-around items-center">
      <BottomNavBarItem
        activeIcon={activeHome}
        path="/"
        icon={home}
        label="홈"
        isActive={currentPage === "home"}
      />
      <BottomNavBarItem
        activeIcon={activeRoutine}
        path="/routines"
        icon={routine}
        label="루틴"
        isActive={currentPage === "routines"}
      />
      <BottomNavBarItem
        activeIcon={activeAnalytics}
        path="/analytics"
        icon={analytics}
        label="분석"
        isActive={currentPage === "analytics"}
      />
      <BottomNavBarItem
        activeIcon={activeSettings}
        path="/settings"
        icon={settings}
        label="설정"
        isActive={currentPage === "settings"}
      />
    </nav>
  );
};

export default BottomNavBar;