import RPESelector from "@/app/(main)/_shared/session/setOptions/RPESelector";
import SetTypeSelector from "@/app/(main)/_shared/session/setOptions/SetTypeSelector";
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import { useState, useEffect, useRef } from "react";

import { WorkoutSetType } from "@/app/(main)/workout/constants";
import { isWorkoutDetail } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { routineDetailService, workoutDetailService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";

type SetOptionSheetProps = {
  detail: LocalWorkoutDetail | LocalRoutineDetail;
};

const SetOptionSheet = ({ detail }: SetOptionSheetProps) => {
  const [setType, setSetType] = useState(detail.setType || "NORMAL");
  const [rpe, setRpe] = useState<number | null>(detail.rpe);
  const { showError } = useModal();
  const isMounted = useRef(false);

  const handleSetTypeChange = (type: WorkoutSetType["value"]) => {
    if (type === setType) return;
    setSetType(type === setType ? "NORMAL" : type);
  };
  const handleChangeRPE = (value: number) => {
    if (rpe === value) return;
    setRpe(rpe === value ? null : value);
  };

  const updateDetail = async () => {
    try {
      const updateInput: Partial<LocalWorkoutDetail> = {
        ...detail,
        setType,
        rpe,
      };
      if (isWorkoutDetail(detail)) {
        await workoutDetailService.updateLocalWorkoutDetail(updateInput);
      } else {
        await routineDetailService.updateLocalRoutineDetail(updateInput);
      }
    } catch (e) {
      console.error(e);
      showError("업데이트에 실패헀습니다");
    }
  };
  useEffect(() => {
    if (isMounted.current) {
      updateDetail();
    } else {
      isMounted.current = true;
    }
  }, [setType, rpe]);

  return (
    <div className="flex flex-col">
      <h3 className="font-semibold">세트 타입</h3>
      <SetTypeSelector
        selectedSetType={setType}
        onChange={handleSetTypeChange}
      />

      <h3 className="font-semibold mt-3">RPE</h3>
      <RPESelector selectedRpe={rpe} onChange={handleChangeRPE} />
    </div>
  );
};

export default SetOptionSheet;
