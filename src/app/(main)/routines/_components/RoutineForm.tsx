"use client";
import RoutineDetailContainer from "@/app/(main)/routines/_components/RoutineDetailContainer";
import { TEMP_ROUTINE_ID } from "@/app/(main)/routines/constants";
import WorkoutContainer from "@/app/(main)/workout/_components/WorkoutContainer";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import editIcon from "public/edit.svg";
import Image from "next/image";
import { useModal } from "@/providers/contexts/ModalContext";
import EditRoutineNameForm from "@/app/(main)/routines/_components/EditRoutineNameForm";
import { routineService } from "@/lib/di";

const RoutineForm = () => {
  const { openModal } = useModal();
  const [name, setName] = useState<string>("");
  const { routineId } = useParams();

  const loadName = async () => {
    const routine = await routineService.getRoutineByLocalId(Number(routineId));
    if (routine) {
      setName(routine.name);
    }
  };

  useEffect(() => {
    loadName();
  }, []);

  const handleClickEditBtn = () => {
    openModal({
      type: "generic",
      children: (
        <EditRoutineNameForm
          routineId={Number(routineId)}
          reload={loadName}
          prevName={name}
        />
      ),
    });
  };

  const routineTitle = (
    <div className="flex items-center gap-2">
      <span>{name}</span>
      <button
        onClick={handleClickEditBtn}
        className="p-1 hover:bg-bg-surface rounded transition-colors"
      >
        <Image src={editIcon} alt="edit_name" width={20} height={20} />
      </button>
    </div>
  );

  return (
    <WorkoutContainer
      type="ROUTINE"
      routineId={Number(routineId)}
      formattedDate={routineTitle}
    />
  );
};

export default RoutineForm;
