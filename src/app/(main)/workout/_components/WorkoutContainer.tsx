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
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLocalRoutineDetails } from "@/services/routineDetail.service";
import { c } from "node_modules/framer-motion/dist/types.d-6pKw1mTI";
import { useNavigationStore } from "@/__mocks__/src/store/useNavigationStore";
import { TEMP_ROUTINE_ID } from "@/app/(main)/routines/constants";
import { usePathname } from "next/navigation";
import { getFormattedDateWithoutDay } from "@/util/formatDate";

type WorkoutContainerProps = {
  type: "ROUTINE" | "RECORD";
  routineId?: number;
  date?: string;
};

const WorkoutContainer = ({ type, date, routineId }: WorkoutContainerProps) => {
  const pathname = usePathname();

  const setRoutineId = useNavigationStore((state) => state.setRoutineId);
  const setRoute = useNavigationStore((state) => state.setPrevRoute);

  const userId = useSession().data?.user?.id;
  const { openBottomSheet } = useBottomSheet();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workoutGroups, setWorkoutGroups] = useState<
    {
      exerciseOrder: number;
      details: LocalWorkoutDetail[] | LocalRoutineDetail[];
    }[]
  >([]);
  const recordRoutineId = () => {
    if (type !== "ROUTINE") return;
    if (routineId !== undefined && routineId !== null) {
      setRoutineId(Number(routineId));
    } else {
      setRoutineId(TEMP_ROUTINE_ID);
    }
  };

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

  const loadLocalRoutineDetails = async () => {
    if (!userId || !routineId) return;
    const details = await getLocalRoutineDetails(routineId);
    console.log(details);
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

  const exercisePath =
    type === "RECORD" ? `/workout/${date}/exercises` : "/routines/exercises";
  useEffect(() => setRoute(pathname), [pathname]);

  useEffect(() => {
    if (type === "RECORD" && userId && date) {
      console.log("이게 실행됐다고?");
      loadLocalWorkoutDetails();
    }
  }, [userId, date, type]);

  useEffect(() => {
    console.log(routineId);
    if (type === "ROUTINE" && routineId) {
      console.log("이거");
      loadLocalRoutineDetails();
    }
  }, [userId, type]);

  useEffect(() => {
    if (date) {
      syncWorkoutStatus();
    }
  }, [workoutGroups]);

  const placeholderProps =
    type === "ROUTINE"
      ? { type: "ROUTINE" as const }
      : { type: "RECORD" as const, date: date! };

  if (isLoading) return <div>Loading...</div>;
  console.log(workoutGroups, "workoutGroupsworkoutGroups");
  return (
    <div>
      {/* {type === "ROUTINE" && (
        <h1 className="text-2xl font-semibold">{"hello"}</h1>
      )} */}
      {workoutGroups.length !== 0 ? (
        <ul className="flex flex-col gap-2.5">
          {workoutGroups.map(({ exerciseOrder, details }) => (
            <WorkoutExerciseGroup
              key={exerciseOrder}
              details={details}
              exerciseOrder={exerciseOrder}
              reload={
                type === "RECORD"
                  ? loadLocalWorkoutDetails
                  : loadLocalRoutineDetails
              }
            />
          ))}
          <Link onClick={recordRoutineId} href={exercisePath}>
            운동 추가
          </Link>
          <button
            onClick={() =>
              openBottomSheet({
                height: "100vh",
                children: (
                  <WorkoutSequence
                    detailGroups={workoutGroups}
                    reload={
                      type === "RECORD"
                        ? loadLocalWorkoutDetails
                        : loadLocalRoutineDetails
                    }
                  />
                ),
              })
            }
          >
            순서바꾸는 버튼
          </button>
        </ul>
      ) : (
        <WorkoutPlaceholder {...placeholderProps} />
      )}
    </div>
  );
};

export default WorkoutContainer;
