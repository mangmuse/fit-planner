"use client";
import RoutineList from "@/app/(main)/routines/_components/routineList/RoutineList";

import Image from "next/image";
import { useRouter } from "next/navigation";
import addBtn from "public/add.svg";

const RoutinesContainer = () => {
  const router = useRouter();

  const handleAddClick = () => router.push("/routines/create");

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-bg-surface rounded-lg hover:bg-bg-surface-variant transition-colors flex items-center gap-2 text-sm"
        >
          <Image src={addBtn} alt="루틴 추가" width={16} height={16} />
          <span>새 루틴</span>
        </button>
      </div>
      <RoutineList />
    </>
  );
};

export default RoutinesContainer;
