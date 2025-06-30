import SetType from "@/app/(main)/workout/_components/setOptions/SetType";
import { SET_TYPES, WorkoutSetType } from "@/app/(main)/workout/constants";

export type SetTypeSelectorProps = {
  selectedSetType: WorkoutSetType["value"] | null;
  onChange: (newSetType: WorkoutSetType["value"]) => void;
};

const SetTypeSelector = ({
  selectedSetType,
  onChange,
}: SetTypeSelectorProps) => {
  return (
    <nav className="self-center mt-1.5 flex gap-1">
      {SET_TYPES.map((type) => (
        <SetType
          key={type.label}
          onChange={onChange}
          isSelected={selectedSetType === type.value}
          setType={type}
        />
      ))}
    </nav>
  );
};

export default SetTypeSelector;
