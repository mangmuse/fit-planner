import { createWorkoutDetail } from "@/adapter/workoutDetail.adapter";
import { mockInvalidFetchWorkoutDetailsResponse } from "./../__mocks__/workoutDetail.mock";
import {
  isWorkoutDetail,
  isWorkoutDetails,
} from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import {
  deleteRoutineDetails,
  getLocalRoutineDetails,
  updateLocalRoutineDetail,
} from "@/services/routineDetail.service";
import {
  deleteLocalWorkout,
  getWorkoutByUserIdAndDate,
  updateLocalWorkout,
} from "@/services/workout.service";
import {
  addLocalWorkoutDetail,
  deleteWorkoutDetails,
  getLocalWorkoutDetails,
  updateLocalWorkoutDetail,
} from "@/services/workoutDetail.service";
import {
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
} from "@/types/models";
import { use, useEffect, useState } from "react";
import { useModal } from "@/providers/contexts/ModalContext";
import { useRouter } from "next/navigation";
import { deleteLocalRoutine } from "@/services/routine.service";

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
  const [workout, setWorkout] = useState<LocalWorkout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allDetails, setAllDetails] = useState<
    LocalWorkoutDetail[] | LocalRoutineDetail[]
  >([]);
  const [workoutGroups, setWorkoutGroups] = useState<WorkoutGroup[]>([]);

  const router = useRouter();
  const { openModal } = useModal();

  const loadLocalDetails = async () => {
    if (type === "RECORD") {
      if (!userId || !date) return;
      const details = await getLocalWorkoutDetails(userId, date);
      setAllDetails(details);
      const adjustedGroups = getGroupedDetails(details);

      setWorkoutGroups(adjustedGroups);
      setIsLoading(false);
      console.log("helooooo");
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

    let currentWorkout = workout;
    if (!currentWorkout) {
      const fetchedWorkout = await getWorkoutByUserIdAndDate(userId, date);
      currentWorkout = fetchedWorkout || null;
      if (!currentWorkout) {
        // 최초 렌더링이나 workout이 아직 생성되지 않은 경우
        return;
      }
      setWorkout(currentWorkout);
    }

    if (!currentWorkout?.id || currentWorkout.status === "COMPLETED") return;
    const newStatus = workoutGroups.length === 0 ? "EMPTY" : "PLANNED";
    await updateLocalWorkout({ ...currentWorkout, status: newStatus });
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

  const handleDeleteAll = async () => {
    async function deleteAll() {
      if (type === "RECORD" && isWorkoutDetails(allDetails) && workout?.id) {
        if (allDetails.length === 0) return;
        await deleteWorkoutDetails(allDetails);
        await deleteLocalWorkout(workout.id);
      } else if (
        type === "ROUTINE" &&
        !isWorkoutDetails(allDetails) &&
        routineId
      ) {
        if (allDetails.length === 0) return;
        if (!routineId) {
          console.error("루틴 ID를 찾을 수 없습니다");
          return;
        }
        await deleteRoutineDetails(allDetails);
        await deleteLocalRoutine(routineId);
      }
      router.push("/");
      setWorkout(null);
    }

    openModal({
      type: "confirm",
      title: "운동 전체 삭제",
      message: "모든 운동을 삭제하시겠습니까?",
      onConfirm: async () => deleteAll(),
    });
  };

  const handleCompleteWorkout = async () => {
    if (type !== "RECORD") return;
    if (!workout?.id) {
      console.error("Workout을 찾을 수 없습니다");
      return;
    }
    // workout status COMPLETED로 변경하고
    const updatedWorkout: Partial<LocalWorkout> = {
      id: workout.id,
      status: "COMPLETED",
    };
    await updateLocalWorkout(updatedWorkout);

    // 메인메이지로 이동
    router.push("/");
  };

  const handleClickCompleteBtn = () =>
    openModal({
      type: "confirm",
      title: "운동 완료",
      message: "운동을 완료하시겠습니까?",
      onConfirm: async () => handleCompleteWorkout(),
    });

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
    workout,
    workoutGroups,
    reload: loadLocalDetails,
    reorderAfterDelete,
    handleClickCompleteBtn,
    handleDeleteAll,
  };
};

export default useLoadDetails;
