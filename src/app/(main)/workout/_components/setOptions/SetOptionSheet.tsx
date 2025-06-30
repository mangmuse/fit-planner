import RPESelector from "@/app/(main)/workout/_components/setOptions/RPESelector";
import SetTypeSelector from "@/app/(main)/workout/_components/setOptions/SetTypeSelector";
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import { useState, useEffect } from "react";

import { WorkoutSetType } from "@/app/(main)/workout/constants";
import { isWorkoutDetail } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { routineDetailService, workoutDetailService } from "@/lib/di";

type SetOptionSheetProps = {
  workoutDetail: LocalWorkoutDetail | LocalRoutineDetail;
};

const SetOptionSheet = ({ workoutDetail }: SetOptionSheetProps) => {
  const [setType, setSetType] = useState(workoutDetail.setType || "NORMAL");
  const [rpe, setRpe] = useState<number | null>(workoutDetail.rpe);

  const handleSetTypeChange = (type: WorkoutSetType["value"]) => {
    setSetType(type === setType ? "NORMAL" : type);
  };
  const handleChangeRPE = (value: number) =>
    setRpe(rpe === value ? null : value);

  useEffect(() => {
    const updateDetail = async () => {
      const updateInput: Partial<LocalWorkoutDetail> = {
        ...workoutDetail,
        setType,
        rpe,
      };
      if (isWorkoutDetail(workoutDetail)) {
        await workoutDetailService.updateLocalWorkoutDetail(updateInput);
      } else {
        await routineDetailService.updateLocalRoutineDetail(updateInput);
      }
    };
    updateDetail();
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
