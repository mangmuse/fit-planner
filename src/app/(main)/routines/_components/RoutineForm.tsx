"use client";
import RoutineDetailContainer from "@/app/(main)/routines/_components/RoutineDetailContainer";
import { TEMP_ROUTINE_ID } from "@/app/(main)/routines/constants";
import WorkoutContainer from "@/app/(main)/workout/_components/WorkoutContainer";
import { getRoutineByLocalId } from "@/services/routine.service";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import editIcon from "public/edit.svg";
import Image from "next/image";
import { useModal } from "@/providers/contexts/ModalContext";
import EditRoutineNameForm from "@/app/(main)/routines/_components/EditRoutineNameForm";

const RoutineForm = () => {
  const { openModal } = useModal();
  const [name, setName] = useState<string>("");
  const { routineId } = useParams();

  const loadName = async () => {
    const routine = await getRoutineByLocalId(Number(routineId));
    setName(routine.name);
  };

  useEffect(() => {
    console.log(routineId, "routineId");
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

  return (
    <>
      <div className="flex gap-1 max-h-10">
        <h1 className="text-2xl font-semibold mb-4">{name}</h1>
        <button onClick={handleClickEditBtn}>
          <Image src={editIcon} alt="edit_name" />
        </button>
      </div>
      <WorkoutContainer type="ROUTINE" routineId={Number(routineId)} />
    </>
  );
};

export default RoutineForm;
