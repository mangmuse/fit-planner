"use client";

import { usePathname } from "next/navigation";
import home from "public/bottom-navbar/home.svg";
import routine from "public/bottom-navbar/routine.svg";
import analytics from "public/bottom-navbar/analytics.svg";
import activeHome from "public/bottom-navbar/active_home.svg";
import activeRoutine from "public/bottom-navbar/active_routine.svg";
import activeAnalytics from "public/bottom-navbar/active_analytics.svg";
import { useEffect, useState } from "react";
import BottomNavBarItem from "./BottomNavBarItem";
import styles from "@/components/styles/BottomNavBar.module.css";
type NavBarItem = "home" | "routines" | "analytics";

const BottomNavBar = () => {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState<NavBarItem>("home");
  useEffect(() => {
    const currentPathname = pathname.slice(1) as NavBarItem;
    setCurrentPage(currentPathname);
  }, [pathname]);

  if (!["/home", "/routines", "/analytics"].includes(pathname)) {
    return null;
  }

  return (
    <nav className={styles.bottomNavBarContainer}>
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
    </nav>
  );
};

export default BottomNavBar;
