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
      <li className={styles.navBarButton} data-active={isActive}>
        <Image
          className={styles.navBarButtonIcon}
          src={isActive ? activeIcon : icon}
          alt={label}
        />
        <span></span>
        <span>{label}</span>
      </li>
    </Link>
  );
};

export default BottomNavBarItem;
