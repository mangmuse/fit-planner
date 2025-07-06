"use client;";

import { useSelectedWorkoutGroups } from "@/store/useSelectedWorkoutGroups";
import PastSessionList from "@/app/(main)/_shared/session/pastSession/PastSessionList";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";

import { LocalWorkout, LocalWorkoutDetail } from "@/types/models";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useAsync } from "@/hooks/useAsync";
import {
  routineDetailAdapter,
  routineDetailService,
  routineService,
  workoutDetailAdapter,
  workoutDetailService,
  workoutService,
} from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import ErrorState from "@/components/ErrorState";

export type LoadPastSessionSheetProps = {
  type: "ROUTINE" | "RECORD";
  reload: () => Promise<void>;
  startExerciseOrder: number;
  routineId?: number;
  date?: string;
};

const LoadPastSessionSheet = ({
  type,
  date,
  routineId,
  reload,
  startExerciseOrder,
}: LoadPastSessionSheetProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { closeBottomSheet } = useBottomSheet();
  const { showError } = useModal();
  const reset = useSelectedWorkoutGroups((state) => state.reset);
  const selectedGroups = useSelectedWorkoutGroups(
    (state) => state.selectedGroups
  );
  const params = useParams<{ date?: string; routineId?: string }>();

  const fetchPastWorkouts = async (): Promise<LocalWorkout[]> => {
    const workouts = await workoutService.getAllWorkouts(userId ?? "");

    return workouts
      .filter((workout) => workout.status !== "EMPTY")
      .filter((workout) => !params.date || workout.date !== params.date);
  };

  const {
    data: pastWorkouts,
    error,
    execute,
  } = useAsync(fetchPastWorkouts, [userId, params.date]);

  const validateInputs = () => {
    if (type === "RECORD" && (!userId || !date)) {
      throw new Error("RECORD 타입에는 userId와 date가 필요합니다");
    }
    if (type === "ROUTINE" && !routineId) {
      throw new Error("ROUTINE 타입에는 routineId가 필요합니다");
    }
  };

  const fetchSelectedDetails = async (): Promise<LocalWorkoutDetail[]> => {
    return workoutDetailService.getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs(
      selectedGroups
    );
  };

  const createExerciseOrderMapping = (
    startOrder: number
  ): Map<number, number> => {
    const exerciseOrderMap = new Map<number, number>();
    let currentOrder = startOrder;

    selectedGroups.forEach((group) => {
      if (!exerciseOrderMap.has(group.exerciseOrder)) {
        exerciseOrderMap.set(group.exerciseOrder, currentOrder);
        currentOrder++;
      }
    });

    return exerciseOrderMap;
  };

  const addDetailsToWorkout = async (
    details: LocalWorkoutDetail[],
    startOrder: number
  ) => {
    const workout = await workoutService.getWorkoutByUserIdAndDate(
      userId!,
      date!
    );
    if (!workout?.id) {
      throw new Error("workout을 찾을 수 없습니다");
    }

    const exerciseOrderMap = createExerciseOrderMapping(startOrder);

    const newDetails = details.map((detail) => {
      const newExerciseOrder =
        exerciseOrderMap.get(detail.exerciseOrder) || startOrder;
      return workoutDetailAdapter.mapPastWorkoutToWorkoutDetail(
        detail,
        workout.id!,
        newExerciseOrder
      );
    });

    await workoutDetailService.addPastWorkoutDetailsToWorkout(newDetails);
  };

  const addDetailsToRoutine = async (
    details: LocalWorkoutDetail[],
    startOrder: number
  ) => {
    const routine = await routineService.getRoutineByLocalId(routineId!);
    if (!routine?.id) {
      throw new Error("루틴을 찾을 수 없습니다");
    }

    const exerciseOrderMap = createExerciseOrderMapping(startOrder);
    const newDetails = details.map((detail) => {
      const newExerciseOrder =
        exerciseOrderMap.get(detail.exerciseOrder) || startOrder;
      return routineDetailAdapter.mapPastWorkoutToRoutineDetail(
        detail,
        routine.id!,
        newExerciseOrder
      );
    });

    await routineDetailService.addPastWorkoutDetailsToRoutine(newDetails);
  };

  const handleAddSelectedWorkout = async () => {
    try {
      validateInputs();

      const allDetails = await fetchSelectedDetails();

      if (type === "RECORD") {
        await addDetailsToWorkout(allDetails, startExerciseOrder);
      } else {
        await addDetailsToRoutine(allDetails, startExerciseOrder);
      }

      await reload();
      closeBottomSheet();
    } catch (e) {
      console.error("[LoadPastSessionSheet] handleAddSelectedWorkout:", e);
      showError("운동 추가 도중 에러가 발생했습니다");
    }
  };

  useEffect(() => {
    return () => reset();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
          <ErrorState
            error="과거 운동 목록을 불러오는데 실패했습니다."
            onRetry={execute}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
        <PastSessionList pastWorkouts={pastWorkouts || []} />
      </div>
      <div className="sticky bottom-0 p-4 bg-bg-primary border-t border-border-gray">
        <button
          onClick={handleAddSelectedWorkout}
          disabled={selectedGroups.length === 0}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
            selectedGroups.length > 0
              ? "bg-primary text-bg-base hover:bg-primary/90 active:scale-95"
              : "bg-bg-surface text-text-muted cursor-not-allowed"
          }`}
        >
          {selectedGroups.length > 0
            ? `선택완료 (${selectedGroups.length}개)`
            : "운동을 선택해주세요"}
        </button>
      </div>
    </div>
  );
};

export default LoadPastSessionSheet;
