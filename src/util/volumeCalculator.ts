import { LocalWorkoutDetail, LocalRoutineDetail, Saved } from "@/types/models";
import { SessionGroup } from "@/hooks/useLoadDetails";
import { convertKgtoLbs, convertLbstoKg } from "@/util/weightConversion";

/**
 * 개별 detail의 weight를 원하는 단위로 변환
 */
const getWeightInUnit = (
  detail: Pick<
    Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>,
    "weight" | "weightUnit"
  >,
  targetUnit: "kg" | "lbs"
): number => {
  const weight = detail.weight || 0;

  if (weight === 0 || detail.weightUnit === targetUnit) {
    return weight;
  }

  return detail.weightUnit === "kg"
    ? convertKgtoLbs(weight)
    : convertLbstoKg(weight);
};

/**
 * 운동 세부사항들로부터 볼륨을 계산
 */
export const calculateVolumeFromDetails = (
  details: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[],
  targetUnit: "kg" | "lbs"
): number => {
  if (details.length === 0) return 0;

  return details.reduce((total, detail) => {
    const weightInTargetUnit = getWeightInUnit(detail, targetUnit);
    const reps = detail.reps || 0;
    return total + weightInTargetUnit * reps;
  }, 0);
};

/**
 * 전체 운동 그룹들의 총 볼륨을 계산
 */
export const calculateTotalVolume = (
  workoutGroups: SessionGroup[],
  targetUnit: "kg" | "lbs"
): number => {
  return workoutGroups.reduce((total, group) => {
    return total + calculateVolumeFromDetails(group.details, targetUnit);
  }, 0);
};
