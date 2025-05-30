import RoutineItem from "@/app/(main)/routines/_components/RoutineItem";
import { getAllLocalRoutines } from "@/services/routine.service";
import { LocalRoutine } from "@/types/models";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const RoutineList = ({
  onPick,
}: {
  onPick?: (routineId: number) => Promise<void>;
}) => {
  const [routines, setRoutines] = useState<LocalRoutine[]>([]);
  const userId = useSession().data?.user?.id;

  useEffect(() => {
    (async () => {
      if (userId) {
        const allRoutines = await getAllLocalRoutines(userId);
        setRoutines(allRoutines);
      }
    })();
  }, [userId]);
  console.log(routines);
  return (
    <>
      {routines.length > 0 && (
        <ul className="flex flex-col gap-4 ">
          {routines.map((item) => (
            <RoutineItem key={item.id} onPick={onPick} routine={item} />
          ))}
        </ul>
      )}
    </>
  );
};

export default RoutineList;
