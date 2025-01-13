import Image from "next/image";
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
      <li
        className={`flex flex-col justify-center items-center text-center text-muted text-xs cursor-pointer ${
          isActive ? "text-primary" : "text-text-muted"
        }`}
      >
        <Image src={isActive ? activeIcon : icon} alt={label} />
        <span className="">{label}</span>
      </li>
    </Link>
  );
};

export default BottomNavBarItem;
