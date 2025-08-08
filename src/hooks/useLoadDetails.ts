import { LocalRoutineDetail, LocalWorkoutDetail, Saved } from "@/types/models";

import { useDetailsData } from "@/hooks/useDetailsData";

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
  const { setWorkout } = setData;

  return {
    error,
    isLoading,
    workout,
    workoutGroups,
    reload,
    setWorkout,
  };
};

export default useLoadDetails;
