"use client";

import ExerciseMemo from "@/app/(main)/workout/_components/ExerciseMemo";
import SetOptionSheet from "@/app/(main)/workout/_components/SetOptionSheet";
import WorkoutExerciseGroup from "@/app/(main)/workout/_components/WorkoutExerciseGroup";
import WorkoutPlaceholder from "@/app/(main)/workout/_components/WorkoutPlaceholder";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import TestModal from "@/components/Modal/testModal";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { useModal } from "@/providers/contexts/ModalContext";
import {
  updateLocalWorkout,
  getWorkoutByUserIdAndDate,
} from "@/services/workout.service";
import { getLocalWorkoutDetails } from "@/services/workoutDetail.service";
import { LocalWorkoutDetail } from "@/types/models";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

type WorkoutContainerProps = {
  date: string;
};

const WorkoutContainer = ({ date }: WorkoutContainerProps) => {
  const userId = useSession().data?.user?.id;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workoutGroups, setWorkoutGroups] = useState<
    { exerciseOrder: number; details: LocalWorkoutDetail[] }[]
  >([]);

  const loadLocalWorkoutDetails = async () => {
    if (!userId) return;
    const details = await getLocalWorkoutDetails(userId, date);

    const adjustedGroups = getGroupedDetails(details);
    setWorkoutGroups(adjustedGroups);
    setIsLoading(false);
  };
  const syncWorkoutStatus = async () => {
    if (!userId) return;
    const workout = await getWorkoutByUserIdAndDate(userId, date);

    if (!workout?.id || workout.status === "COMPLETED") return;
    const newStatus = workoutGroups.length === 0 ? "EMPTY" : "PLANNED";
    await updateLocalWorkout({ ...workout, status: newStatus });
  };

  useEffect(() => {
    loadLocalWorkoutDetails();
  }, [userId, date]);

  useEffect(() => {
    syncWorkoutStatus();
  }, [workoutGroups]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {workoutGroups.length !== 0 ? (
        <ul className="flex flex-col gap-2.5">
          {workoutGroups.map(({ exerciseOrder, details }) => (
            <WorkoutExerciseGroup
              key={exerciseOrder}
              details={details}
              exerciseOrder={exerciseOrder}
              loadLocalWorkoutDetails={loadLocalWorkoutDetails}
            />
          ))}
          <Link href={`/workout/${date}/exercises`}>운동 추가</Link>
        </ul>
      ) : (
        <WorkoutPlaceholder date={date} />
      )}
    </div>
  );
};

export default WorkoutContainer;
