import { LocalRoutineDetail, LocalWorkoutDetail, Saved } from "@/types/models";

import { useDetailsData } from "@/hooks/useDetailsData";
import { useDetailsOperations } from "@/hooks/useDetailsOperations";

type UseLoadDetailsProps = {
  type: "RECORD" | "ROUTINE";
  userId: string;
  date?: string;
  routineId?: number;
};

export type SessionGroup = {
  exerciseOrder: number;
  details: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[];
};

const useLoadDetails = ({
  type,
  userId,
  date,
  routineId,
}: UseLoadDetailsProps) => {
  const { data, setData, isLoading, error, reload } = useDetailsData(
    type,
    userId,
    date,
    routineId
  );
  const { workout, workoutGroups } = data;
  const { setWorkoutGroups, setWorkout } = setData;
  const operations = useDetailsOperations({
    setWorkoutGroups,
    workoutGroups,
  });

  return {
    error,
    isLoading,
    workout,
    workoutGroups,
    reload,
    setWorkout,
    ...operations,
  };
};

export default useLoadDetails;
