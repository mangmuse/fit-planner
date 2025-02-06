"use client";

import WorkoutExerciseGroup from "@/app/(main)/workout/_components/WorkoutExerciseGroup";
import useWorkoutDetailsQuery from "@/hooks/api/query/useWorkoutDetailsQuery";
import { ClientWorkoutDetail } from "@/types/models";
import { useSession } from "next-auth/react";
import Link from "next/link";

type WorkoutContainerProps = {
  initialWorkoutDetails: ClientWorkoutDetail[];
  date: string;
};

const WorkoutContainer = ({
  initialWorkoutDetails,
  date,
}: WorkoutContainerProps) => {
  const userId = useSession().data?.user?.id;
  const { data: workoutDetail } = useWorkoutDetailsQuery(
    userId,
    date,
    initialWorkoutDetails
  );
  const groupedDetails = workoutDetail.reduce((acc, detail) => {
    if (!acc.has(detail.exerciseOrder)) {
      acc.set(detail.exerciseOrder, []);
    }
    acc.get(detail.exerciseOrder)!.push(detail);
    return acc;
  }, new Map<number, ClientWorkoutDetail[]>());
  const groups = Array.from(groupedDetails, ([exerciseOrder, details]) => ({
    exerciseOrder,
    details,
  }));
  console.log(groups);
  return (
    <div>
      <ul className="flex flex-col gap-2.5">
        {groups.map(({ exerciseOrder, details }) => (
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
