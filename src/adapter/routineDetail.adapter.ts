import { IRoutineDetailAdapter, RD_NewInput } from "@/types/adapters";
import {
  LocalExercise,
  LocalRoutine,
  LocalRoutineDetail,
  LocalRoutineDetailWithServerRoutineId,
  LocalWorkoutDetail,
} from "@/types/models";

export class RoutineDetailAdapter implements IRoutineDetailAdapter {
  constructor() {}

  getInitialRoutineDetail(): LocalRoutineDetail {
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
  }

  createRoutineDetail(
    override: Partial<LocalRoutineDetail>
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
      throw new Error("...");

    const defaultValue = this.getInitialRoutineDetail();

    return {
      ...defaultValue,
      ...override,
    };
  }

  getNewRoutineDetails(
    selectedExercises: { id: number | undefined; name: string }[],
    { routineId, startOrder }: RD_NewInput
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
        return this.createRoutineDetail(newValue);
      }
    );

    return newDetails;
  }

  getAddSetToRoutineByLastSet(lastSet: LocalRoutineDetail): LocalRoutineDetail {
    const { id, rpe, setOrder, isSynced, updatedAt, ...rest } = lastSet;
    const addSetInput = {
      ...rest,
      rpe: 0,
      serverId: null,
      isSynced: false,
      setOrder: setOrder + 1,
      createdAt: new Date().toISOString(),
    };

    return this.createRoutineDetail(addSetInput);
  }

  mapPastWorkoutToRoutineDetail(
    pastWorkoutDetail: LocalWorkoutDetail,
    targetRoutineId: number,
    newExerciseOrder: number
  ): LocalRoutineDetail {
    const initialDetail = this.getInitialRoutineDetail();

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

  mapLocalRoutineDetailToServer(
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
}
