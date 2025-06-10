import { createWorkoutDetail } from "@/adapter/workoutDetail.adapter";
import { mockInvalidFetchWorkoutDetailsResponse } from "./../__mocks__/workoutDetail.mock";
import { isWorkoutDetail } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import {
  getLocalRoutineDetails,
  updateLocalRoutineDetail,
} from "@/services/routineDetail.service";
import {
  getWorkoutByUserIdAndDate,
  updateLocalWorkout,
} from "@/services/workout.service";
import {
  addLocalWorkoutDetail,
  getLocalWorkoutDetails,
  updateLocalWorkoutDetail,
} from "@/services/workoutDetail.service";
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import { use, useEffect, useState } from "react";

type UseLoadDetailsProps = {
  type: "RECORD" | "ROUTINE";
  userId: string;
  date?: string;
  routineId?: number;
};

export type WorkoutGroup = {
  exerciseOrder: number;
  details: LocalWorkoutDetail[] | LocalRoutineDetail[];
};

const useLoadDetails = ({
  type,
  userId,
  date,
  routineId,
}: UseLoadDetailsProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allDetails, setAllDetails] = useState<
    LocalWorkoutDetail[] | LocalRoutineDetail[]
  >([]);
  const [workoutGroups, setWorkoutGroups] = useState<WorkoutGroup[]>([]);

  const loadLocalDetails = async () => {
    if (type === "RECORD") {
      if (!userId || !date) return;
      const details = await getLocalWorkoutDetails(userId, date);
      setAllDetails(details);
      const adjustedGroups = getGroupedDetails(details);

      setWorkoutGroups(adjustedGroups);
      setIsLoading(false);
    } else if (type === "ROUTINE") {
      if (!userId || !routineId) return;
      const details = await getLocalRoutineDetails(routineId);
      setAllDetails(details);
      const adjustedGroups = getGroupedDetails(details);
      setWorkoutGroups(adjustedGroups);
      setIsLoading(false);
    }
  };

  const syncWorkoutStatus = async () => {
    if (!date || !userId) return;
    // if (!userId) return;
    const workout = await getWorkoutByUserIdAndDate(userId, date);

    if (!workout?.id || workout.status === "COMPLETED") return;
    const newStatus = workoutGroups.length === 0 ? "EMPTY" : "PLANNED";
    await updateLocalWorkout({ ...workout, status: newStatus });
  };

  const reorderAfterDelete = async (
    deletedExerciseOrder: number
  ): Promise<void> => {
    // 1. 삭제한 세트 제외한 나머지 중 exerciseOrder가 큰 것들만 필터링
    const affectedDetails = allDetails.filter(
      (d) => d.exerciseOrder > deletedExerciseOrder
    );
    // 2. exerciseOrder를 1씩 감소시키면서 DB 업데이트
    const details = await Promise.all(
      affectedDetails.map((detail) => {
        const updated = { ...detail, exerciseOrder: detail.exerciseOrder - 1 };
        if (isWorkoutDetail(detail)) {
          return updateLocalWorkoutDetail(updated);
        } else {
          return updateLocalRoutineDetail(updated);
        }
      })
    );
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
    isLoading,
    workoutGroups,
    reload: loadLocalDetails,
    reorderAfterDelete,
  };
};

export default useLoadDetails;
