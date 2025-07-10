import { useState, useEffect } from "react";

const WEIGHT_UNIT_KEY = "preferred_weight_unit";

export function useWeightUnitPreference() {
  const [unit, setUnit] = useState<"kg" | "lbs">(() => {
    if (typeof window === "undefined") return "kg";
    return (localStorage.getItem(WEIGHT_UNIT_KEY) as "kg" | "lbs") || "kg";
  });

  const setPreferredUnit = (newUnit: "kg" | "lbs") => {
    setUnit(newUnit);
    localStorage.setItem(WEIGHT_UNIT_KEY, newUnit);
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WEIGHT_UNIT_KEY && e.newValue) {
        setUnit(e.newValue as "kg" | "lbs");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return [unit, setPreferredUnit] as const;
}

export function getPreferredWeightUnit(): "kg" | "lbs" {
  if (typeof window === "undefined") return "kg";
  return (localStorage.getItem(WEIGHT_UNIT_KEY) as "kg" | "lbs") || "kg";
}
