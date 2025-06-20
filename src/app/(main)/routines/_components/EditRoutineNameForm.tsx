"use client";

import { routineService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
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
    await routineService.updateLocalRoutine({
      id: routineId,
      name,
    });
    await reload();
    closeModal();
  };

  return (
    <div className="w-full min-w-[280px]">
      <h3 className="text-lg font-semibold text-text-white text-center mb-4">
        루틴명 변경
      </h3>
      <input
        autoFocus
        value={name}
        onChange={handleChange}
        placeholder="루틴명을 입력해주세요"
        className="w-full px-4 py-3 bg-bg-surface rounded-xl text-text-white placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary mb-6"
      />
      <div className="flex justify-center gap-3">
        <button
          onClick={closeModal}
          className="flex-1 py-3 bg-bg-surface text-text-white font-medium rounded-xl hover:bg-bg-surface-variant transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleUpdateName}
          className="flex-1 py-3 bg-primary text-text-black font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          변경
        </button>
      </div>
    </div>
  );
};

export default EditRoutineNameForm;
