export const KG_TO_LBS = 2.205;

export const formatWeight = (value: number, unit: "kg" | "lbs") => {
  const decimals = unit === "kg" ? 1 : 0;
  return `${value.toFixed(decimals)} ${unit}`;
};

export const convertLbstoKg = (lbs: number): number => lbs / KG_TO_LBS;

export const convertKgtoLbs = (kg: number): number => kg * KG_TO_LBS;

export const ensureKg = (value: number, unit: "kg" | "lbs"): number => {
  return unit === "kg" ? value : value / KG_TO_LBS;
};
