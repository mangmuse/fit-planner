"use client";
import WorkoutContainer from "@/app/(main)/workout/_components/WorkoutContainer";
import { routineService } from "@/services/routine.service";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RoutineNameForm = () => {
  const userId = useSession().data?.user?.id;
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [hasName, setHasName] = useState<boolean>(false);

  const handleAddRoutine = async () => {
    if (!userId) return;

    const routineId = await routineService.addLocalRoutine({ name, userId });
    router.push(`/routines/${routineId}`);
  };

  return (
    <>
      <input
        value={name}
        autoFocus
        type="text"
        placeholder="루틴 이름을 입력하세요"
        className="text-black w-full h-12 px-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        onChange={(e) => setName(e.target.value)}
      />
      {name && (
        <button
          onClick={handleAddRoutine}
          className="fixed left-1/2 -translate-x-1/2 bottom-8 w-[330px] h-[47px] bg-primary text-text-black font-bold rounded-2xl shadow-xl"
        >
          루틴 만들러 가기
        </button>
      )}
    </>
  );
};

export default RoutineNameForm;
