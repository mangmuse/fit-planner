import RPEItem from "@/app/(main)/workout/_components/RPEItem";
import { RPE_OPTIONS } from "@/app/(main)/workout/constants";
import { useState } from "react";

const RPESelector = () => {
  const [selectedRPE, setSelectedRPE] = useState<number | null>(null);

  const handleChangeRPE = (value: number) => setSelectedRPE(value);

  return (
    <nav className="mt-1.5 flex self-center gap-1">
      {RPE_OPTIONS.map((rpe) => (
        <RPEItem
          key={rpe.value}
          isSelected={selectedRPE === rpe.value}
          onChange={handleChangeRPE}
          rpeOption={rpe}
        />
      ))}
    </nav>
  );
};

export default RPESelector;
