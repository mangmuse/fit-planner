import { getExerciseWithLocalId } from "@/services/exercise.service";
import { getRoutineByLocalId } from "@/services/routine.service";
import { NewRoutineDetailInput } from "@/services/routineDetail.service";
import {
  LocalRoutineDetail,
  LocalRoutineDetailWithServerRoutineId,
  LocalWorkoutDetail,
} from "@/types/models";

export const getInitialRoutineDetail = (): LocalRoutineDetail => {
  return {
    serverId: null,
    weight: 0,
    rpe: null,
    reps: 0,
    isSynced: false,
    setOrder: 1,
    exerciseOrder: 1,
    setType: "NORMAL",
    exerciseName: "",
    exerciseId: 0,
    routineId: -9999,
    createdAt: new Date().toISOString(),
  };
};

export const createRoutineDetail = (
  override: Partial<LocalRoutineDetail>
): LocalRoutineDetail => {
  const { exerciseName, exerciseId, exerciseOrder, setOrder, routineId } =
    override;
  if (!exerciseName || !exerciseId || !exerciseOrder || !setOrder || !routineId)
    throw new Error("...");

  const defaultValue = getInitialRoutineDetail();

  return {
    ...defaultValue,
    ...override,
  };
};

export const getNewRoutineDetails = (
  selectedExercises: { id: number | undefined; name: string }[],
  { routineId, startOrder }: NewRoutineDetailInput
): LocalRoutineDetail[] => {
  const newDetails: LocalRoutineDetail[] = selectedExercises.map(
    ({ id, name }, idx) => {
      if (!id || !name)
        throw new Error(
          "getNewDetails: exerciseId 또는 exerciseName이 없습니다"
        );
      const newValue = {
        exerciseId: id,
        routineId,
        exerciseOrder: startOrder + idx,
        setOrder: 1,
        exerciseName: name,
      };
      return createRoutineDetail(newValue);
    }
  );

  return newDetails;
};

export const getAddSetToRoutineByLastSet = (
  lastSet: LocalRoutineDetail
): LocalRoutineDetail => {
  const { id, rpe, setOrder, isSynced, updatedAt, ...rest } = lastSet;
  const addSetInput = {
    ...rest,
    rpe: 0,
    serverId: null,
    isSynced: false,
    setOrder: setOrder + 1,
    createdAt: new Date().toISOString(),
  };

  return createRoutineDetail(addSetInput);
};

export const mapPastWorkoutToRoutineDetail = (
  pastWorkoutDetail: LocalWorkoutDetail,
  targetRoutineId: number,
  newExerciseOrder: number
): LocalRoutineDetail => {
  const initialDetail = getInitialRoutineDetail();

  // isDone 제외하고 나머지 필드 매핑
  return {
    ...initialDetail,
    routineId: targetRoutineId,
    exerciseId: pastWorkoutDetail.exerciseId,
    exerciseName: pastWorkoutDetail.exerciseName,
    exerciseOrder: newExerciseOrder,
    setOrder: pastWorkoutDetail.setOrder,
    weight: pastWorkoutDetail.weight,
    reps: pastWorkoutDetail.reps,
    rpe: pastWorkoutDetail.rpe,
    setType: pastWorkoutDetail.setType,
  };
};

export const convertLocalRoutineDetailsToServer = async (
  routineDetails: LocalRoutineDetail[]
): Promise<LocalRoutineDetailWithServerRoutineId[]> => {
  return await Promise.all(
    routineDetails.map(async (detail) => {
      const exercise = await getExerciseWithLocalId(detail.exerciseId);
      const routine = await getRoutineByLocalId(detail.routineId);
      if (!exercise?.serverId || !routine?.serverId) {
        throw new Error("exerciseId 또는 workoutId가 없습니다");
      }
      return {
        ...detail,
        exerciseId: exercise.serverId,
        routineId: routine.serverId,
      };
    })
  );
};
