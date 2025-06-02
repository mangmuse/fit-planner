"use client;";

import PastWorkoutList from "@/app/(main)/workout/_components/PastWorkoutList";
import { getAllWorkouts } from "@/services/workout.service";
import { LocalWorkout } from "@/types/models";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const LoadPastWorkoutSheet = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const params = useParams<{ date?: string; routineId?: string }>();
  const [pastWorkouts, setPastWorkouts] = useState<LocalWorkout[]>([]);

  useEffect(() => {
    (async () => {
      let workouts = await getAllWorkouts(userId ?? "");

      if (params.date) {
        workouts = workouts.filter((workout) => workout.date !== params.date);
      }
      setPastWorkouts(workouts);
    })();
  }, [userId, params.date]);
  return (
    <>
      <PastWorkoutList pastWorkouts={pastWorkouts} />
    </>
  );
};

export default LoadPastWorkoutSheet;
