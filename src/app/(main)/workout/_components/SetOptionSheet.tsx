import RPESelector from "@/app/(main)/workout/_components/RPESelector";
import SetTypeSelector from "@/app/(main)/workout/_components/SetTypeList";
import { WorkoutSetType } from "@/app/(main)/workout/constants";
import { LocalWorkoutDetail } from "@/types/models";
import { useState } from "react";

type SetOptionSheetProps = {
  workoutDetail: LocalWorkoutDetail;
};

const SetOptionSheet = ({ workoutDetail }: SetOptionSheetProps) => {
  const { setType: prevSetType } = workoutDetail;
  const [selectedSetType, setSelectedSetType] = useState<
    WorkoutSetType["value"]
  >(prevSetType ?? "NORMAL");

  const handleSetTypeChange = (type: WorkoutSetType["value"]) => {
    setSelectedSetType((prev) => (type === prev ? "NORMAL" : type));
  };
  return (
    <div className="flex flex-col">
      <h3 className="font-semibold ">세트 타입</h3>
      <SetTypeSelector
        onChange={handleSetTypeChange}
        selectedSetType={selectedSetType}
      />

      <h3 className="font-semibold mt-3">RPE</h3>
      <RPESelector />
    </div>
  );
};

export default SetOptionSheet;
