"use client";

import { syncToServerWorkoutDetails } from "@/services/workoutDetail.service";
import WorkoutExerciseGroup from "@/app/(main)/workout/_components/WorkoutExerciseGroup";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import useWorkoutDetailsQuery from "@/hooks/api/query/useWorkoutDetailsQuery";
import { db } from "@/lib/db";
import { getLocalWorkoutDetails } from "@/services/workoutDetail.service";
import { addLocalWorkout } from "@/services/workout.service";
import { ClientWorkoutDetail, LocalWorkoutDetail } from "@/types/models";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

type WorkoutContainerProps = {
  date: string;
};

const WorkoutContainer = ({ date }: WorkoutContainerProps) => {
  const userId = useSession().data?.user?.id;

  const [workoutGroups, setWorkoutGroups] = useState<
    { exerciseOrder: number; details: LocalWorkoutDetail[] }[]
  >([]);
  console.log("이거는 몇번실행?");

  const loadLocalWorkoutDetails = async () => {
    console.log("userId: ", userId, "date", date);
    if (!userId) return;
  const details = await getLocalWorkoutDetails(userId, date);
    const adjustedGroups = getGroupedDetails(details);
    setWorkoutGroups(adjustedGroups);
  };
  useEffect(() => {
    loadLocalWorkoutDetails();
  }, [userId, date]);

  return (
    <div>
      <ul className="flex flex-col gap-2.5">
        {workoutGroups.map(({ exerciseOrder, details }) => (
          <WorkoutExerciseGroup
            key={exerciseOrder}
            details={details}
            exerciseOrder={exerciseOrder}
            loadLocalWorkoutDetails={loadLocalWorkoutDetails}
          />
        ))}
      </ul>
      <Link href={`/workout/${date}/exercises`}>운동 추가</Link>
    </div>
  );
};

export default WorkoutContainer;
