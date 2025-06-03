"use client;";

import { useSelectedWokroutDetails } from "@/__mocks__/src/store/useSelectedWorkoutDetails";
import PastWorkoutList from "@/app/(main)/workout/_components/PastWorkoutList";
import { getAllWorkouts } from "@/services/workout.service";
import { LocalWorkout } from "@/types/models";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const LoadPastWorkoutSheet = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const reset = useSelectedWokroutDetails((state) => state.reset);
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

    return () => reset();
  }, [userId, params.date]);
  return (
    <>
      <PastWorkoutList pastWorkouts={pastWorkouts} />
    </>
  );
};

export default LoadPastWorkoutSheet;

// 선택완료 클릭시
// selected Ids 루프돌려서 각각 detail가져와서 개조해서 추가
// 개조 어떻게?
// =>
