"use client";

import { useModal } from "@/providers/contexts/ModalContext";
import { updateLocalRoutine } from "@/services/routine.service";
import { ChangeEventHandler, useEffect, useState } from "react";

type EditRoutineNameFormProps = {
  prevName: string;
  routineId: number;
  reload: () => Promise<void>;
};

const EditRoutineNameForm = ({
  prevName,
  routineId,
  reload,
}: EditRoutineNameFormProps) => {
  const { closeModal } = useModal();
  const [name, setName] = useState<string>(prevName);
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.target.value);
  };

  const handleUpdateName = async () => {
    await updateLocalRoutine({
      id: routineId,
      name,
    });
    await reload();
    closeModal();
  };

  return (
    <div>
      <input
        autoFocus
        value={name}
        onChange={handleChange}
        placeholder="루틴명을 입력해주세요"
      />
      <div className="flex justify-center gap-2">
        <button onClick={closeModal}>취소</button>
        <button onClick={handleUpdateName}>변경</button>
      </div>
    </div>
  );
};

export default EditRoutineNameForm;
