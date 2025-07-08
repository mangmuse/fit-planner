import Link from "next/link";
import { LucideIcon } from "lucide-react";

const BottomNavBarItem = ({
  path,
  icon: Icon,
  label,
  isActive,
}: {
  path: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
}) => {
  return (
    <Link href={path} aria-label={label}>
      <li
        role="listitem"
        aria-label={isActive ? "활성화" : "비활성화"}
        className={`flex flex-col justify-center items-center text-center text-muted text-xs cursor-pointer ${
          isActive ? "text-primary" : "text-text-muted"
        }`}
      >
        <Icon
          className={`w-6 h-6 ${isActive ? "text-primary" : "text-white"}`}
        />
        <span className="">{label}</span>
      </li>
    </Link>
  );
};

export default BottomNavBarItem;
