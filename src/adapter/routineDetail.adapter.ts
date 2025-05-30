import { getExerciseWithLocalId } from "@/services/exercise.service";
import { getRoutineByLocalId } from "@/services/routine.service";
import { NewRoutineDetailInput } from "@/services/routineDetail.service";
import {
  LocalRoutineDetail,
  LocalRoutineDetailWithServerRoutineId,
} from "@/types/models";

export const createRoutineDetail = (
  override: Partial<LocalRoutineDetail>
): LocalRoutineDetail => {
  const { exerciseName, exerciseId, exerciseOrder, setOrder, routineId } =
    override;
  if (!exerciseName || !exerciseId || !exerciseOrder || !setOrder || !routineId)
    throw new Error(
      "exerciseName, exerciseId, exerciseOrder, setOrder, routineId 는 필수 입력사항입니다."
    );

  const defaultValue: LocalRoutineDetail = {
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
