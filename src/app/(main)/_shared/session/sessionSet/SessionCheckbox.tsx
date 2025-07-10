import { useState } from "react";
import Image from "next/image";
import checkIcon from "public/check.svg";
import { workoutDetailService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { LocalWorkoutDetail, Saved } from "@/types/models";

export type SessionCheckboxProps = {
  prevIsDone?: boolean;
  updateDetailInGroups: (updatedDetail: Saved<LocalWorkoutDetail>) => void;
  detail: Saved<LocalWorkoutDetail>;
};

const SessionCheckbox = ({
  prevIsDone,
  updateDetailInGroups,
  detail,
}: SessionCheckboxProps) => {
  const [isDone, setIsDone] = useState<boolean>(prevIsDone ?? false);
  const { showError } = useModal();
  const handleChange = async () => {
    try {
      const newValue = !isDone;
      setIsDone(newValue);
      const updatedDetail = {
        ...detail,
        isDone: newValue,
      };
      await workoutDetailService.updateLocalWorkoutDetail(updatedDetail);
      updateDetailInGroups(updatedDetail as Saved<LocalWorkoutDetail>);
    } catch (e) {
      console.error("[SessionCheckbox] Error", e);
      showError("운동 상태를 동기화하는데 실패했습니다");
    }
  };
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        onChange={handleChange}
        type="checkbox"
        checked={isDone}
        className="sr-only peer"
      />
      <div className="relative flex items-center justify-center w-[16px] h-[16px] rounded border-[1.5px] border-text-muted peer-checked:bg-primary peer-checked:border-primary transition-all duration-200">
        {isDone && <Image src={checkIcon} alt="완료" width={10} height={10} />}
      </div>
    </label>
  );
};

export default SessionCheckbox;
