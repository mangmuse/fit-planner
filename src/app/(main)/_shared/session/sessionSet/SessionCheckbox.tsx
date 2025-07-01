import { useState } from "react";
import Image from "next/image";
import checkIcon from "public/check.svg";
import { workoutDetailService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";

export type SessionCheckboxProps = {
  prevIsDone?: boolean;
  id: number;
  reload?: () => Promise<void>;
};

const SessionCheckbox = ({ prevIsDone, id, reload }: SessionCheckboxProps) => {
  const [isDone, setIsDone] = useState<boolean>(prevIsDone ?? false);
  const { showError } = useModal();
  const handleChange = async () => {
    try {
      const newValue = !isDone;
      setIsDone(newValue);
      await workoutDetailService.updateLocalWorkoutDetail({
        isDone: newValue,
        id,
      });
      if (reload) reload();
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
