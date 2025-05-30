"use client";
import RoutineList from "@/app/(main)/routines/_components/RoutineList";
import { getAllLocalRoutines } from "@/services/routine.service";
import { LocalRoutine } from "@/types/models";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import addBtn from "public/add.svg";
import { useEffect, useState } from "react";

const RoutinesContainer = () => {
  const router = useRouter();

  const handleAddClick = () => router.push("/routines/create");

  return (
    <>
      <Image onClick={handleAddClick} src={addBtn} alt="루틴 추가" />
      <RoutineList />
    </>
  );
};

export default RoutinesContainer;
