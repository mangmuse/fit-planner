"use client";

import WorkoutExerciseGroup from "@/app/(main)/workout/_components/WorkoutExerciseGroup";
import WorkoutPlaceholder from "@/app/(main)/workout/_components/WorkoutPlaceholder";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
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
  useEffect(() => {
    loadLocalWorkoutDetails();
  }, [userId, date]);

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
