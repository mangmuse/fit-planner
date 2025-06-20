import RoutineItem from "@/app/(main)/routines/_components/RoutineItem";
import { LocalRoutine } from "@/types/models";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import plusCircle from "public/plus-circle.svg";
import ErrorState from "@/components/ErrorState";
import { routineService } from "@/lib/di";

const RoutineList = ({
  onPick,
}: {
  onPick?: (routineId: number) => Promise<void>;
}) => {
  const [routines, setRoutines] = useState<LocalRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = useSession().data?.user?.id;
  const loadRoutines = async () => {
    if (!userId) return;

    try {
      setError(null);
      setIsLoading(true);
      const allRoutines = await routineService.getAllLocalRoutines(userId);
      setRoutines(allRoutines);
    } catch (e) {
      setError("루틴 목록을 불러올 수 없습니다");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadRoutines();
  }, [userId]);
  if (error) {
    return <ErrorState error={error} onRetry={loadRoutines} />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">Loading...</div>
    );
  }
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
