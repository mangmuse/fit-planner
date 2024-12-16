import Image from "next/image";
import Link from "next/link";
import styles from "@/components/styles/BottomNavBarItem.module.css";

const BottomNavBarItem = ({
  path,
  icon,
  activeIcon,
  label,
  isActive,
}: {
  path: string;
  icon: string;
  activeIcon: string;
  label: string;
  isActive: boolean;
}) => {
  return (
    <Link href={path}>
      <li
        className={styles.navBarButton}
        data-active={isActive}
        style={{ color: "#b0eb5f" }}
      >
        <Image
          className={styles.navBarButtonIcon}
          src={isActive ? activeIcon : icon}
          alt={label}
        />
        <span>{label}</span>
      </li>
    </Link>
  );
};

export default BottomNavBarItem;
