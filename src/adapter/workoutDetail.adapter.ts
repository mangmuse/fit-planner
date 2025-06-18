import { db } from "@/lib/db";
import { exerciseService } from "@/services/exercise.service";
import { workoutService } from "@/services/workout.service";
import { NewWorkoutDetailInput } from "@/services/workoutDetail.service";
import {
  LocalRoutineDetail,
  LocalWorkoutDetail,
  LocalWorkoutDetailWithServerWorkoutId,
} from "@/types/models";

export const workoutDetailAdapter = {
  getInitialWorkoutDetail(): LocalWorkoutDetail {
    return {
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
      createdAt: new Date().toISOString(),
    };
  },

  createWorkoutDetail(
    override: Partial<LocalWorkoutDetail>
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

    const defaultValue: LocalWorkoutDetail = this.getInitialWorkoutDetail();

    return {
      ...defaultValue,
      ...override,
    };
  },

  mapPastWorkoutToWorkoutDetail(
    pastWorkoutDetail: LocalWorkoutDetail,
    targetWorkoutId: number,
    newExerciseOrder: number
  ): LocalWorkoutDetail {
    // 같은 객체의 다른 메소드를 호출하도록 변경
    const initialDetail = this.getInitialWorkoutDetail();

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
  },

  getAddSetToWorkoutByLastSet(lastSet: LocalWorkoutDetail): LocalWorkoutDetail {
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
    return this.createWorkoutDetail(addSetInput);
  },

  getNewWorkoutDetails(
    selectedExercises: { id: number | undefined; name: string }[],
    { workoutId, startOrder }: NewWorkoutDetailInput
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
        return this.createWorkoutDetail(newValue);
      }
    );

    return newDetails;
  },

  async convertLocalWorkoutDetailToServer(
    workoutDetails: LocalWorkoutDetail[]
  ): Promise<LocalWorkoutDetailWithServerWorkoutId[]> {
    return await Promise.all(
      workoutDetails.map(async (detail) => {
        // 외부 의존성은 그대로 사용
        const exercise = await exerciseService.getExerciseWithLocalId(
          detail.exerciseId
        );
        const workout = await workoutService.getWorkoutWithLocalId(
          detail.workoutId
        );

        if (!exercise?.serverId || !workout?.serverId) {
          throw new Error("exerciseId 또는 workoutId가 없습니다");
        }
        return {
          ...detail,
          exerciseId: exercise.serverId,
          workoutId: workout.serverId,
        };
      })
    );
  },

  async convertServerWorkoutDetailToLocal(
    workoutDetails: LocalWorkoutDetailWithServerWorkoutId[]
  ): Promise<LocalWorkoutDetail[]> {
    return await Promise.all(
      workoutDetails.map(async (detail) => {
        const exercise = await exerciseService.getExerciseWithServerId(
          detail.exerciseId
        );
        const workout = await workoutService.getWorkoutWithServerId(
          detail.workoutId
        );

        if (!exercise?.id || !workout?.id) {
          throw new Error("exerciseId 또는 workoutId가 없습니다.");
        }
        return {
          ...detail,
          exerciseId: exercise.id,
          workoutId: workout.id,
        };
      })
    );
  },

  convertRoutineDetailToWorkoutDetailInput(
    routineDetail: LocalRoutineDetail,
    workoutId: LocalWorkoutDetail["workoutId"]
  ): LocalWorkoutDetail {
    const { createdAt, updatedAt, isSynced, serverId, routineId, id, ...rest } =
      routineDetail;
    const workoutDetail: Partial<LocalWorkoutDetail> = {
      ...rest,
      isDone: false,
      workoutId,
    };
    // 같은 객체의 다른 메소드를 호출하도록 변경
    return this.createWorkoutDetail(workoutDetail);
  },
};
