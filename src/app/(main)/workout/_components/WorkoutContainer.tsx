"use client";

import WorkoutSequence from "@/app/(main)/workout/_components/WorkoutSequence";
import WorkoutExerciseGroup from "@/app/(main)/workout/_components/WorkoutExerciseGroup";
import WorkoutPlaceholder from "@/app/(main)/workout/_components/WorkoutPlaceholder";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
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
  type: "ROUTINE" | "RECORD";
  date?: string;
};

const WorkoutContainer = ({ type, date }: WorkoutContainerProps) => {
  const userId = useSession().data?.user?.id;
  const { openBottomSheet } = useBottomSheet();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workoutGroups, setWorkoutGroups] = useState<
    { exerciseOrder: number; details: LocalWorkoutDetail[] }[]
  >([]);

  const loadLocalWorkoutDetails = async () => {
    if (!date) throw new Error("날짜없어요");
    console.log("실행됐지롱");
    if (!userId) return;
    const details = await getLocalWorkoutDetails(userId, date);
    console.log("먼ㅇ라ㅣ머라ㅣㅁ언라ㅣㅁ");

    const adjustedGroups = getGroupedDetails(details);

    console.log(adjustedGroups);
    setWorkoutGroups(adjustedGroups);

    setIsLoading(false);
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
    loadLocalWorkoutDetails();
  }, [userId, date]);

  useEffect(() => {
    syncWorkoutStatus();
  }, [workoutGroups]);

  if (isLoading) return <div>Loading...</div>;
  console.log(workoutGroups, "workoutGroupsworkoutGroups");
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
          <button
            onClick={() =>
              openBottomSheet({
                height: "100vh",
                children: (
                  <WorkoutSequence
                    detailGroups={workoutGroups}
                    loadLocalWorkoutDetails={loadLocalWorkoutDetails}
                  />
                ),
              })
            }
          >
            순서바꾸는 버튼
          </button>
        </ul>
      ) : (
        <WorkoutPlaceholder type="RECORD" date={date!} />
      )}
    </div>
  );
};

export default WorkoutContainer;
