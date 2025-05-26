import { LocalRoutine } from "@/types/models";
import Link from "next/link";

type RoutineItemProps = {
  routine: LocalRoutine;
};

const RoutineItem = ({ routine }: RoutineItemProps) => {
  return (
    <Link href={`/routines/${routine.id}`}>
      <li className="p-2 w-full h-20 bg-bg-surface rounded-xl">
        <p>{routine.name}</p>
      </li>
    </Link>
  );
};

export default RoutineItem;
