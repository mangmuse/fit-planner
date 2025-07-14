"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useModal } from "@/providers/contexts/ModalContext";
import EditRoutineNameForm from "@/app/(main)/routines/_components/routineForm/EditRoutineNameForm";
import { routineService } from "@/lib/di";
import SessionContainer from "@/app/(main)/_shared/session/SessionContainer";

const RoutineForm = () => {
  const { openModal } = useModal();
  const [name, setName] = useState<string>("");
  const { routineId } = useParams();
  const loadName = useCallback(async () => {
    if (routineId) {
      const routine = await routineService.getRoutineByLocalId(
        Number(routineId)
      );
      if (routine) {
        setName(routine.name);
      }
    }
  }, [routineId]);

  useEffect(() => {
    loadName();
  }, [loadName]);

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
        <Pencil className="w-5 h-5 text-text-muted" />
      </button>
    </div>
  );

  return (
    <SessionContainer
      type="ROUTINE"
      routineId={Number(routineId)}
      formattedDate={routineTitle}
    />
  );
};

export default RoutineForm;
