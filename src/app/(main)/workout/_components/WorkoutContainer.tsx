"use client";

import WorkoutExerciseGroup from "@/app/(main)/workout/_components/WorkoutExerciseGroup";
import useWorkoutDetailsQuery from "@/hooks/api/query/useWorkoutDetailsQuery";
import { db } from "@/lib/db";
import { addLocalWorkout } from "@/lib/localWorkoutService";
import { ClientWorkoutDetail, LocalWorkoutDetail } from "@/types/models";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

type WorkoutContainerProps = {
  date: string;
};

const WorkoutContainer = ({ date }: WorkoutContainerProps) => {
  const userId = useSession().data?.user?.id;
  // const { data: workoutDetail } = useWorkoutDetailsQuery(
  //   userId,
  //   date,
  //   initialWorkoutDetails
  // );
  const [workoutGroups, setWorkoutGroups] = useState<
    { exerciseOrder: number; details: LocalWorkoutDetail[] }[]
  >([]);

  const loadLocalWorkoutDetails = async () => {
    if (!userId) return;
    const { id } = await addLocalWorkout(userId, date);
    console.log(id);
    if (!id) return;
    const details = await db.workoutDetails
      .where("workoutId")
      .equals(id)
      .toArray();

    const groupedDetails = details.reduce((acc, detail) => {
      if (!acc.has(detail.exerciseOrder)) {
        acc.set(detail.exerciseOrder, []);
      }
      acc.get(detail.exerciseOrder)!.push(detail);
      return acc;
    }, new Map<number, LocalWorkoutDetail[]>());
    const groups = Array.from(groupedDetails, ([exerciseOrder, details]) => ({
      exerciseOrder,
      details,
    }));
    setWorkoutGroups(groups);
  };
  const hello = async () => {};
  useEffect(() => {
    (async () => {
      await loadLocalWorkoutDetails();
    })();
  }, [userId, date]);

  return (
    <div>
      <ul className="flex flex-col gap-2.5">
        {workoutGroups.map(({ exerciseOrder, details }) => (
          <WorkoutExerciseGroup
            key={exerciseOrder}
            details={details}
            exerciseOrder={exerciseOrder}
          />
        ))}
      </ul>
      <Link href={`/workout/${date}/exercises`}>운동 추가</Link>
    </div>
  );
};

export default WorkoutContainer;
