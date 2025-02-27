import SetType from "@/app/(main)/workout/_components/setType";
import { SET_TYPES, WorkoutSetType } from "@/app/(main)/workout/constants";
import { useState } from "react";

const SetTypeSelector = () => {
  const [selectedSetType, setSelectedSetType] = useState<
    WorkoutSetType["label"] | null
  >(null);

  const handleSetTypeChange = (type: WorkoutSetType["label"]) => {
    setSelectedSetType((prev) => (type === prev ? null : type));
  };

  return (
    <nav className="self-center mt-1.5 flex gap-1">
      {SET_TYPES.map((type) => (
        <SetType
          onChange={handleSetTypeChange}
          isSelected={selectedSetType === type.label}
          key={type.label}
          setType={type}
        />
      ))}
    </nav>
  );
};

export default SetTypeSelector;
