import RPEItem from "@/app/(main)/workout/_components/RPEItem";
import { RPE_OPTIONS } from "@/app/(main)/workout/constants";
import { LocalWorkoutDetail } from "@/types/models";

type RPESelectorProps = {
  selectedRpe: number | null;
  onChange: (newRpe: number | null) => void;
};

const RPESelector = ({ selectedRpe, onChange }: RPESelectorProps) => {
  return (
    <nav className="mt-1.5 flex self-center gap-1">
      {RPE_OPTIONS.map((rpe) => (
        <RPEItem
          key={rpe.value}
          isSelected={selectedRpe === rpe.value}
          onChange={onChange}
          rpeOption={rpe}
        />
      ))}
    </nav>
  );
};

export default RPESelector;
