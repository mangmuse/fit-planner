import Image from "next/image";
import { navBarButton, navBarButtonIcon } from "../styles/BottomNavBar.css";
import Link from "next/link";

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
      <li className={navBarButton({ isActive })}>
        <Image
          className={navBarButtonIcon}
          src={isActive ? activeIcon : icon}
          alt={label}
        />
        <span>{label}</span>
      </li>
    </Link>
  );
};

export default BottomNavBarItem;
