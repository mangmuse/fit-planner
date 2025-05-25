"use client";
import RoutineList from "@/app/(main)/routines/_components/RoutineList";
import Image from "next/image";
import { useRouter } from "next/navigation";
import addBtn from "public/add.svg";

const RoutineContainer = () => {
  const router = useRouter();
  const handleAddClick = () => router.push("/routines/create");

  return (
    <>
      <Image onClick={handleAddClick} src={addBtn} alt="루틴 추가" />
      <RoutineList />
    </>
  );
};

export default RoutineContainer;
