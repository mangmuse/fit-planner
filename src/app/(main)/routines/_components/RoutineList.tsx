import RoutineItem from "@/app/(main)/routines/_components/RoutineItem";
import { LocalRoutine } from "@/types/models";

type RoutineListProps = {
  routines: LocalRoutine[];
};

const RoutineList = ({ routines }: RoutineListProps) => {
  console.log(routines);
  return (
    <>
      {routines.length && (
        <ul className="flex flex-col gap-4">
          {routines.map((item) => (
            <RoutineItem key={item.id} routine={item} />
          ))}
        </ul>
      )}
    </>
  );
};

export default RoutineList;
