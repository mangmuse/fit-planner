"use client";

import WorkoutExerciseGroup from "@/app/(main)/workout/_components/WorkoutExerciseGroup";
import WorkoutItem from "@/app/(main)/workout/_components/WorkoutItem";
import { ClientWorkoutDetail } from "@/types/models";
import Link from "next/link";

type WorkoutContainerProps = {
  workoutDetails: ClientWorkoutDetail[];
  date: string;
};

const WorkoutContainer = ({ workoutDetails, date }: WorkoutContainerProps) => {
  const groupedDetails = workoutDetails.reduce((acc, detail) => {
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
    <>
      {groups.map(({ exerciseOrder, details }) => (
        <WorkoutExerciseGroup
          key={exerciseOrder}
          details={details}
          exerciseOrder={exerciseOrder}
        />
      ))}

      <Link href={`/workout/${date}/exercises`}>운동 추가</Link>
    </>
  );
};

export default WorkoutContainer;
