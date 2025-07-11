"use client";

import { useCallback } from "react";
import clsx from "clsx";
import { useWeightUnitPreference } from "@/hooks/useWeightUnitPreference";

type WeightUnit = "kg" | "lbs";

const UNITS: WeightUnit[] = ["kg", "lbs"];

const getButtonClasses = (isActive: boolean): string => {
  return clsx(
    "px-4 py-1.5 rounded-md text-sm font-medium transition-colors min-w-[50px]",
    {
      "bg-primary text-black shadow-sm font-semibold": isActive,
      "text-text-muted hover:text-white hover:bg-bg-tertiary": !isActive,
    }
  );
};

export const WeightUnitSetting = () => {
  const [unit, setPreferredUnit] = useWeightUnitPreference();

  const handleUnitChange = useCallback(
    (newUnit: WeightUnit) => {
      setPreferredUnit(newUnit);
    },
    [setPreferredUnit]
  );

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-white">기본 무게 단위</p>
        <p className="text-text-muted text-sm">새 운동 생성 시 기본 단위</p>
      </div>
      <div
        aria-label={`현재 무게 단위: ${unit}`}
        className="flex bg-bg-secondary rounded-lg p-1 gap-1"
      >
        {UNITS.map((unitOption) => (
          <button
            key={unitOption}
            type="button"
            aria-label={`${unitOption} 단위 선택`}
            onClick={() => handleUnitChange(unitOption)}
            className={getButtonClasses(unit === unitOption)}
          >
            {unitOption}
          </button>
        ))}
      </div>
    </div>
  );
};
