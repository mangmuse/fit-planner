import RoutineItem from "@/app/(main)/routines/_components/RoutineItem";
import { getAllLocalRoutines } from "@/services/routine.service";
import { LocalRoutine } from "@/types/models";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import plusCircle from "public/plus-circle.svg";

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
  return (
    <>
      {routines.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {routines.map((item) => (
            <RoutineItem key={item.id} onPick={onPick} routine={item} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-16 h-16 bg-bg-surface rounded-full flex items-center justify-center mb-4">
            <Image 
              src={plusCircle} 
              alt="추가" 
              width={32} 
              height={32}
            />
          </div>
          <p className="text-text-muted mb-2">아직 루틴이 없습니다</p>
          <p className="text-text-muted text-sm">위의 + 버튼을 눌러 새 루틴을 만들어보세요</p>
        </div>
      )}
    </>
  );
};

export default RoutineList;
