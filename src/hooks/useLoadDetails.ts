import {
  isWorkoutDetail,
  isWorkoutDetails,
} from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import {
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
  Saved,
} from "@/types/models";
import { useEffect, useState } from "react";
import {
  routineDetailService,
  workoutDetailService,
  workoutService,
} from "@/lib/di";

type UseLoadDetailsProps = {
  type: "RECORD" | "ROUTINE";
  userId: string;
  date?: string;
  routineId?: number;
};

export type WorkoutGroup = {
  exerciseOrder: number;
  details: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[];
};

const useLoadDetails = ({
  type,
  userId,
  date,
  routineId,
}: UseLoadDetailsProps) => {
  const [workout, setWorkout] = useState<LocalWorkout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [allDetails, setAllDetails] = useState<
    Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[]
  >([]);
  const [workoutGroups, setWorkoutGroups] = useState<WorkoutGroup[]>([]);

  const loadLocalDetails = async () => {
    try {
      setIsInitialLoading(true);
      if (type === "RECORD") {
        if (!userId || !date) return;
        const details = await workoutDetailService.getLocalWorkoutDetails(
          userId,
          date
        );
        setAllDetails(details);
        const adjustedGroups = getGroupedDetails(details);

        setWorkoutGroups(adjustedGroups);
      } else if (type === "ROUTINE") {
        if (!userId || !routineId) return;
        const details =
          await routineDetailService.getLocalRoutineDetails(routineId);
        setAllDetails(details);
        const adjustedGroups = getGroupedDetails(details);
        setWorkoutGroups(adjustedGroups);
      }
    } catch (e) {
      console.error(e);
      setError("운동 세부 정보를 불러오는데 실패했습니다");
    } finally {
      setIsInitialLoading(false);
    }
  };

  const syncWorkoutStatus = async () => {
    try {
      if (!date || !userId) return;

      let currentWorkout = workout;
      if (!currentWorkout) {
        const fetchedWorkout = await workoutService.getWorkoutByUserIdAndDate(
          userId,
          date
        );
        currentWorkout = fetchedWorkout || null;
        if (!currentWorkout) {
          // 최초 렌더링이나 workout이 아직 생성되지 않은 경우
          return;
        }
        setWorkout(currentWorkout);
      }
      if (!currentWorkout?.id || currentWorkout.status === "COMPLETED") return;
      const newStatus = workoutGroups.length === 0 ? "EMPTY" : "PLANNED";
      await workoutService.updateLocalWorkout({
        ...currentWorkout,
        status: newStatus,
      });
    } catch (e) {
      console.error("[useLoadDetails] Error", e);
      setError("운동 상태를 동기화하는데 실패했습니다");
    }
  };

  useEffect(() => {
    (async () => {
      await loadLocalDetails();
    })();
  }, [type, userId, date, routineId]);

  useEffect(() => {
    if (type === "RECORD" && date) {
      syncWorkoutStatus();
    }
  }, [workoutGroups]);

  return {
    error,
    isLoading: isInitialLoading,
    allDetails,
    setAllDetails,
    workout,
    workoutGroups,
    reload: loadLocalDetails,
    setWorkout,
  };
};

export default useLoadDetails;
