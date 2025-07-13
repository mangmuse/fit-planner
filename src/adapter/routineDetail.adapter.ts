import { IRoutineDetailAdapter, RD_NewInput } from "@/types/adapters";
import {
  LocalExercise,
  LocalRoutine,
  LocalRoutineDetail,
  LocalRoutineDetailWithServerRoutineId,
  LocalWorkoutDetail,
  Saved,
} from "@/types/models";
export const INITIAL_ROUTINE_DETAIL_BASE: Omit<
  LocalRoutineDetail,
  "createdAt" | "weightUnit"
> = {
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
};
export class RoutineDetailAdapter implements IRoutineDetailAdapter {
  constructor() {}

  getInitialRoutineDetail(weightUnit: "kg" | "lbs" = "kg"): LocalRoutineDetail {
    return {
      ...INITIAL_ROUTINE_DETAIL_BASE,
      weightUnit,
      createdAt: new Date().toISOString(),
    };
  }

  createRoutineDetail(
    override: Partial<LocalRoutineDetail>,
    weightUnit: "kg" | "lbs" = "kg"
  ): LocalRoutineDetail {
    const { exerciseName, exerciseId, exerciseOrder, setOrder, routineId } =
      override;
    if (
      !exerciseName ||
      !exerciseId ||
      !exerciseOrder ||
      !setOrder ||
      !routineId
    )
      throw new Error(
        "exerciseName, exerciseId, exerciseOrder, setOrder, routineId 는 필수 입력사항입니다."
      );

    const defaultValue = this.getInitialRoutineDetail(weightUnit);

    return {
      ...defaultValue,
      ...override,
    };
  }

  getNewRoutineDetails(
    selectedExercises: { id: number | undefined; name: string }[],
    { routineId, startOrder }: RD_NewInput,
    weightUnit: "kg" | "lbs" = "kg"
  ): LocalRoutineDetail[] {
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
        return this.createRoutineDetail(newValue, weightUnit);
      }
    );

    return newDetails;
  }

  getAddSetToRoutineByLastSet(
    lastSet: LocalRoutineDetail,
    weightUnit: "kg" | "lbs" = "kg"
  ): LocalRoutineDetail {
    const { id, rpe, setOrder, isSynced, updatedAt, ...rest } = lastSet;
    const addSetInput = {
      ...rest,
      rpe: 0,
      serverId: null,
      isSynced: false,
      setOrder: setOrder + 1,
      createdAt: new Date().toISOString(),
    };

    return this.createRoutineDetail(addSetInput, weightUnit);
  }

  mapPastWorkoutToRoutineDetail(
    pastWorkoutDetail: LocalWorkoutDetail,
    targetRoutineId: number,
    newExerciseOrder: number,
    weightUnit: "kg" | "lbs" = "kg"
  ): LocalRoutineDetail {
    const initialDetail = this.getInitialRoutineDetail(weightUnit);

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
  }

  public mapLocalRoutineDetailToServer(
    detail: LocalRoutineDetail,
    exercise: LocalExercise,
    routine: LocalRoutine
  ): LocalRoutineDetailWithServerRoutineId {
    if (!exercise?.serverId || !routine?.serverId) {
      throw new Error("exerciseId 또는 routineId가 없습니다");
    }
    return {
      ...detail,
      exerciseId: exercise.serverId,
      routineId: routine.serverId,
    };
  }

  public cloneToCreateInput(
    inputDetail: LocalRoutineDetail,
    newRoutineId: number,
    weightUnit: "kg" | "lbs" = "kg"
  ): LocalRoutineDetail {
    const { id, createdAt, updatedAt, ...rest } = inputDetail;
    return {
      ...rest,
      routineId: newRoutineId,
      serverId: null,
      isSynced: false,
      weightUnit,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
  }

  getReorderedDetailsAfterExerciseDelete(
    details: Saved<LocalRoutineDetail>[],
    deletedExerciseOrder: number
  ): Saved<LocalRoutineDetail>[] {
    return details
      .filter((d) => d.exerciseOrder > deletedExerciseOrder)
      .map((detail) => ({
        ...detail,
        exerciseOrder: detail.exerciseOrder - 1,
      }));
  }

  getReorderedDetailsAfterSetDelete(
    details: Saved<LocalRoutineDetail>[],
    exerciseId: number,
    deletedSetOrder: number
  ): Saved<LocalRoutineDetail>[] {
    return details
      .filter((d) => d.exerciseId === exerciseId && d.setOrder > deletedSetOrder)
      .map((detail) => ({
        ...detail,
        setOrder: detail.setOrder - 1,
      }));
  }
}
