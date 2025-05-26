import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import { getLocalRoutineDetails } from "@/services/routineDetail.service";
import {
  getWorkoutByUserIdAndDate,
  updateLocalWorkout,
} from "@/services/workout.service";
import { getLocalWorkoutDetails } from "@/services/workoutDetail.service";
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import { useEffect, useState } from "react";

type UseLoadDetailsProps = {
  type: "RECORD" | "ROUTINE";
  userId: string;
  date?: string;
  routineId?: number;
};

const useLoadDetails = ({
  type,
  userId,
  date,
  routineId,
}: UseLoadDetailsProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workoutGroups, setWorkoutGroups] = useState<
    {
      exerciseOrder: number;
      details: LocalWorkoutDetail[] | LocalRoutineDetail[];
    }[]
  >([]);

  const loadLocalDetails = async () => {
    if (type === "RECORD") {
      if (!userId || !date) throw new Error("날짜 없어요");
      const details = await getLocalWorkoutDetails(userId, date);
      const adjustedGroups = getGroupedDetails(details);
      setWorkoutGroups(adjustedGroups);
      setIsLoading(false);
    } else if (type === "ROUTINE") {
      if (!userId || !routineId) return;
      const details = await getLocalRoutineDetails(routineId);
      const adjustedGroups = getGroupedDetails(details);
      setWorkoutGroups(adjustedGroups);
      setIsLoading(false);
    }
  };

  const syncWorkoutStatus = async () => {
    if (!date) throw new Error("날짜없어요");
    if (!userId) return;
    const workout = await getWorkoutByUserIdAndDate(userId, date);

    if (!workout?.id || workout.status === "COMPLETED") return;
    const newStatus = workoutGroups.length === 0 ? "EMPTY" : "PLANNED";
    await updateLocalWorkout({ ...workout, status: newStatus });
  };

  useEffect(() => {
    (async () => {
      //   if (type === "RECORD" && userId && date) {
      console.log("WorkoutDetails 로딩중");
      await loadLocalDetails();
      // Load local workout details logic here
      //   } else if (type === "ROUTINE" && userId && routineId) {
      //   console.log("RoutineDetails 로딩중");
      //   await loadLocalDetails();
      // Load local routine details logic here
      //   }
    })();
  }, [type, userId, date, routineId]);

  useEffect(() => {
    if (type === "RECORD" && date) {
      syncWorkoutStatus();
    }
  }, [workoutGroups]);

  return { isLoading, workoutGroups };
};

export default useLoadDetails;
