"use client";
import RoutineDetailContainer from "@/app/(main)/routines/_components/RoutineDetailContainer";
import { TEMP_ROUTINE_ID } from "@/app/(main)/routines/constants";
import WorkoutContainer from "@/app/(main)/workout/_components/WorkoutContainer";
import { useParams } from "next/navigation";

const RoutineForm = () => {
  const { routineId } = useParams();
  const id = routineId ?? TEMP_ROUTINE_ID;

  return <WorkoutContainer type="ROUTINE" routineId={Number(id)} />;
};

export default RoutineForm;
