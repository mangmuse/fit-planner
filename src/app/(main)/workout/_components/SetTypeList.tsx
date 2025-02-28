import SetType from "@/app/(main)/workout/_components/setType";
import { SET_TYPES, WorkoutSetType } from "@/app/(main)/workout/constants";
import { LocalWorkoutDetail } from "@/types/models";
import { useState } from "react";

type SetTypeSelectorProps = {
  selectedSetType: LocalWorkoutDetail["setType"];
  onChange: (value: WorkoutSetType["value"]) => void;
};

const SetTypeSelector = ({
  selectedSetType,
  onChange,
}: SetTypeSelectorProps) => {
  return (
    <nav className="self-center mt-1.5 flex gap-1">
      {SET_TYPES.map((type) => (
        <SetType
          onChange={onChange}
          isSelected={selectedSetType === type.value}
          key={type.label}
          setType={type}
        />
      ))}
    </nav>
  );
};

export default SetTypeSelector;
