"use client";
import RoutineList from "@/app/(main)/routines/_components/RoutineList";
import { getAllLocalRoutines } from "@/services/routine.service";
import { LocalRoutine } from "@/types/models";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import addBtn from "public/add.svg";
import { useEffect, useState } from "react";

const RoutineContainer = () => {
  const [routines, setRoutines] = useState<LocalRoutine[]>([]);
  const userId = useSession().data?.user?.id;
  const router = useRouter();
  const handleAddClick = () => router.push("/routines/create");
  useEffect(() => {
    (async () => {
      if (userId) {
        const allRoutines = await getAllLocalRoutines(userId);
        setRoutines(allRoutines);
      }
    })();
  }, [userId]);

  return (
    <>
      <Image onClick={handleAddClick} src={addBtn} alt="루틴 추가" />
      <RoutineList routines={routines} />
    </>
  );
};

export default RoutineContainer;
