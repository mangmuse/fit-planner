"use client";

import { useNavigationStore } from "@/__mocks__/src/store/useNavigationStore";
import { TEMP_ROUTINE_ID } from "@/app/(main)/routines/constants";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect } from "react";

type WorkoutPlaceholderProps =
  | { type: "ROUTINE"; date?: undefined } // ROUTINE은 date 없어도 됨
  | { type: "RECORD"; date: string };

function WorkoutPlaceholder({ type, date }: WorkoutPlaceholderProps) {
  const pathname = usePathname();
  const setRoutineId = useNavigationStore((state) => state.setRoutineId);
  const setRoute = useNavigationStore((state) => state.setPrevRoute);
  const { routineId } = useParams();
  const recordRoutineId = () => {
    if (type !== "ROUTINE") return;
    if (routineId !== undefined && routineId !== null) {
      setRoutineId(Number(routineId));
    } else {
      setRoutineId(TEMP_ROUTINE_ID);
    }
  };

  const addExercisePath =
    type === "RECORD" ? `/workout/${date}/exercises` : "/routines/exercises";
  useEffect(() => setRoute(pathname), [pathname]);
  return (
    <div className="flex flex-col mt-6 gap-3 ">
      <Link
        href="/routines"
        className="flex justify-center items-center w-full h-[47px] font-bold rounded-2xl bg-primary text-text-black"
      >
        나의 루틴 가져오기
      </Link>
      <Link
        onClick={recordRoutineId}
        href={addExercisePath}
        className="flex justify-center items-center w-full h-[47px] font-bold rounded-2xl bg-primary text-text-black"
      >
        운동 추가하기
      </Link>
    </div>
  );
}

export default WorkoutPlaceholder;
