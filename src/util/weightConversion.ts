export const KG_TO_LBS = 2.205;

export const formatWeight = (value: number, unit: "kg" | "lbs") => {
  if (unit === "kg") {
    const rounded = Math.round(value * 100) / 100; // 소수점 2자리
    return `${
      rounded % 1 === 0
        ? rounded.toFixed(0)
        : rounded.toFixed(2).replace(/\.?0+$/, "")
    } ${unit}`;
  } else {
    return `${value.toFixed(0)} ${unit}`;
  }
};

const cleanNumericInput = (value: string): string => {
  const numericValue = value.replace(/[^0-9.]/g, "");

  const parts = numericValue.split(".");
  return parts.length > 2
    ? parts[0] + "." + parts.slice(1).join("")
    : numericValue;
};

const parseKgWeight = (cleanValue: string): number | null => {
  const parsed = parseFloat(cleanValue);
  return !isNaN(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : null;
};

const parseLbsWeight = (cleanValue: string): number | null => {
  const parsed = parseInt(cleanValue);
  return !isNaN(parsed) && parsed >= 0 ? parsed : null;
};

export const parseWeightInput = (
  value: string,
  unit: "kg" | "lbs"
): number | null => {
  if (!value.trim()) {
    return null;
  }

  if (value.includes("-")) {
    return null;
  }

  const cleanValue = cleanNumericInput(value);

  return unit === "kg" ? parseKgWeight(cleanValue) : parseLbsWeight(cleanValue);
};

export const convertLbstoKg = (lbs: number): number => lbs / KG_TO_LBS;

export const convertKgtoLbs = (kg: number): number => kg * KG_TO_LBS;

export const ensureKg = (value: number, unit: "kg" | "lbs"): number => {
  return unit === "kg" ? value : value / KG_TO_LBS;
};
