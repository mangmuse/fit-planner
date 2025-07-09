import { LocalWorkoutDetail, LocalRoutineDetail, Saved } from "@/types/models";
import { SessionGroup } from "@/hooks/useLoadDetails";

/**
 * 운동 세부사항들로부터 볼륨을 계산
 * 볼륨 = weight × reps의 합계
 */
export const calculateVolumeFromDetails = (
  details: Saved<LocalWorkoutDetail>[] | Saved<LocalRoutineDetail>[]
): number => {
  if (details.length === 0) return 0;

  return details.reduce((total, detail) => {
    const weight = detail.weight || 0;
    const reps = detail.reps || 0;
    return total + weight * reps;
  }, 0);
};

/**
 * 전체 운동 그룹들의 총 볼륨을 계산
 */
export const calculateTotalVolume = (workoutGroups: SessionGroup[]): number => {
  return workoutGroups.reduce((total, group) => {
    return total + calculateVolumeFromDetails(group.details);
  }, 0);
};
