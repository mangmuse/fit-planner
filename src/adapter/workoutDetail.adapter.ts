import { IWorkoutDetailAdapter, WD_NewInput } from "@/types/adapters";
import {
  ClientWorkoutDetail,
  LocalExercise,
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
  LocalWorkoutDetailWithServerWorkoutId,
} from "@/types/models";

export const INITIAL_WORKOUT_DETAIL_BASE: Omit<
  LocalWorkoutDetail,
  "createdAt" | "weightUnit"
> = {
  serverId: null,
  weight: 0,
  rpe: null,
  reps: 0,
  isDone: false,
  isSynced: false,
  setOrder: 1,
  exerciseOrder: 1,
  setType: "NORMAL",
  exerciseName: "",
  exerciseId: 0,
  workoutId: 0,
};
export class WorkoutdetailAdapter implements IWorkoutDetailAdapter {
  getInitialWorkoutDetail(weightUnit: "kg" | "lbs" = "kg"): LocalWorkoutDetail {
    return {
      ...INITIAL_WORKOUT_DETAIL_BASE,
      weightUnit,
      createdAt: new Date().toISOString(),
    };
  }

  createWorkoutDetail(
    override: Partial<LocalWorkoutDetail>,
    weightUnit: "kg" | "lbs" = "kg"
  ): LocalWorkoutDetail {
    const { exerciseName, exerciseId, exerciseOrder, setOrder, workoutId } =
      override;
    if (
      !exerciseName ||
      !exerciseId ||
      !exerciseOrder ||
      !setOrder ||
      !workoutId
    )
      throw new Error(
        "exerciseName, exerciseId, exerciseOrder, setOrder, workoutId 는 필수 입력사항입니다."
      );

    const defaultValue: LocalWorkoutDetail =
      this.getInitialWorkoutDetail(weightUnit);

    return {
      ...defaultValue,
      ...override,
    };
  }

  mapPastWorkoutToWorkoutDetail(
    pastWorkoutDetail: LocalWorkoutDetail,
    targetWorkoutId: number,
    newExerciseOrder: number,
    weightUnit: "kg" | "lbs" = "kg"
  ): LocalWorkoutDetail {
    // 같은 객체의 다른 메소드를 호출하도록 변경
    const initialDetail = this.getInitialWorkoutDetail(weightUnit);

    return {
      ...initialDetail,
      workoutId: targetWorkoutId,
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

  getAddSetToWorkoutByLastSet(
    lastSet: LocalWorkoutDetail,
    weightUnit: "kg" | "lbs" = "kg"
  ): LocalWorkoutDetail {
    const { id, rpe, setOrder, isSynced, isDone, updatedAt, ...rest } = lastSet;
    const addSetInput = {
      ...rest,
      rpe: 0,
      serverId: null,
      isSynced: false,
      isDone: false,
      setOrder: setOrder + 1,
      createdAt: new Date().toISOString(),
    };

    // 같은 객체의 다른 메소드를 호출하도록 변경
    return this.createWorkoutDetail(addSetInput, weightUnit);
  }

  getNewWorkoutDetails(
    selectedExercises: { id: number | undefined; name: string }[],
    { workoutId, startOrder }: WD_NewInput,
    weightUnit: "kg" | "lbs" = "kg"
  ): LocalWorkoutDetail[] {
    const newDetails: LocalWorkoutDetail[] = selectedExercises.map(
      ({ id, name }, idx) => {
        if (!id || !name)
          throw new Error(
            "getNewDetails: exerciseId 또는 exerciseName이 없습니다"
          );
        const newValue = {
          exerciseId: id,
          workoutId,
          exerciseOrder: startOrder + idx,
          setOrder: 1,
          exerciseName: name,
        };
        // 같은 객체의 다른 메소드를 호출하도록 변경
        return this.createWorkoutDetail(newValue, weightUnit);
      }
    );

    return newDetails;
  }

  mapLocalWorkoutDetailToServer(
    detail: LocalWorkoutDetail,
    relatedExercise: LocalExercise,
    relatedWorkout: LocalWorkout
  ): LocalWorkoutDetailWithServerWorkoutId {
    if (!relatedExercise?.serverId || !relatedWorkout?.serverId) {
      throw new Error("exerciseId 또는 workoutId가 없습니다");
    }
    return {
      ...detail,
      exerciseId: relatedExercise.serverId,
      workoutId: relatedWorkout.serverId,
    };
  }

  createOverwriteWorkoutDetailPayload(
    detail: ClientWorkoutDetail,
    exercise: LocalExercise,
    workout: LocalWorkout
  ): LocalWorkoutDetail {
    if (!exercise?.id || !workout?.id) {
      throw new Error("exerciseId 또는 workoutId가 없습니다");
    }
    const { id, ...rest } = detail;
    return {
      ...rest,
      id: undefined,
      serverId: id,
      isSynced: true,
      exerciseId: exercise.id,
      workoutId: workout.id,
    };
  }

  convertRoutineDetailToWorkoutDetailInput(
    routineDetail: LocalRoutineDetail,
    workoutId: LocalWorkoutDetail["workoutId"],
    weightUnit: "kg" | "lbs" = "kg"
  ): LocalWorkoutDetail {
    const { createdAt, updatedAt, isSynced, serverId, routineId, id, ...rest } =
      routineDetail;
    const workoutDetail: Partial<LocalWorkoutDetail> = {
      ...rest,
      isDone: false,
      workoutId,
    };
    // 같은 객체의 다른 메소드를 호출하도록 변경
    return this.createWorkoutDetail(workoutDetail, weightUnit);
  }
}
