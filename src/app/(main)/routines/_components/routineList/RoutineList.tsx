import RoutineItem from "@/app/(main)/routines/_components/routineList/RoutineItem";
import { LocalRoutine } from "@/types/models";
import { useSession } from "next-auth/react";
import Image from "next/image";
import plusCircle from "public/plus-circle.svg";
import ErrorState from "@/components/ErrorState";
import { routineService } from "@/lib/di";
import { useAsync } from "@/hooks/useAsync";

const RoutineList = ({
  onPick,
  excludeRoutineId,
}: {
  onPick?: (routineId: number) => Promise<void>;
  excludeRoutineId?: number;
}) => {
  const userId = useSession().data?.user?.id;

  const {
    data: routines,
    isLoading,
    error,
    execute: loadRoutines,
  } = useAsync(async () => {
    if (!userId) return [];
    return await routineService.getAllLocalRoutines(userId);
  }, [userId]);

  const filteredRoutines =
    routines?.filter((routine) =>
      excludeRoutineId ? routine.id !== excludeRoutineId : true
    ) || [];

  if (error) {
    return <ErrorState error={error.message} onRetry={loadRoutines} />;
  }

  return (
    <>
      {filteredRoutines && filteredRoutines.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {filteredRoutines.map((item) => (
            <RoutineItem key={item.id} onPick={onPick} routine={item} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-16 h-16 bg-bg-surface rounded-full flex items-center justify-center mb-4">
            <Image src={plusCircle} alt="추가" width={32} height={32} />
          </div>
          <p className="text-text-muted mb-2">아직 루틴이 없습니다</p>
          <p className="text-text-muted text-sm">
            위의 + 버튼을 눌러 새 루틴을 만들어보세요
          </p>
        </div>
      )}
    </>
  );
};

export default RoutineList;
