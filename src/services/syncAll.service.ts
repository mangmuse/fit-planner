import { ISyncAllAdapter } from "@/types/adapters";
import { ISyncAllApi } from "@/types/apis";
import {
  LocalRoutine,
  NestedRoutine,
  NestedWorkout,
  Saved,
} from "@/types/models";
import {
  IExerciseService,
  IRoutineDetailService,
  IRoutineService,
  ISyncAllService,
  IWorkoutDetailService,
  IWorkoutService,
} from "@/types/services";

export class SyncAllService implements ISyncAllService {
  constructor(
    private readonly exerciseService: IExerciseService,
    private readonly workoutService: IWorkoutService,
    private readonly routineService: IRoutineService,
    private readonly workoutDetailService: IWorkoutDetailService,
    private readonly routineDetailService: IRoutineDetailService,
    private readonly api: ISyncAllApi,
    private readonly adapter: ISyncAllAdapter
  ) {}

  public overWriteAllWithServerData = async (userId: string) => {
    await this.exerciseService.overwriteWithServerExercises(userId);

    await this.workoutService.overwriteWithServerWorkouts(userId);
    await this.routineService.overwriteWithServerRoutines(userId);

    await this.workoutDetailService.overwriteWithServerWorkoutDetails(userId);
    await this.routineDetailService.overwriteWithServerRoutineDetails(userId);
  };

  public overWriteToServer = async (userId: string) => {
    const exercises = await this.exerciseService.getAllLocalExercises(userId);
    const workouts = await this.workoutService.getAllWorkouts(userId);
    const routines = await this.routineService.getAllLocalRoutines(userId);

    const workoutIds = workouts.map((workout) => workout.id);
    const routineIds = routines.map((routine) => routine.id);

    const workoutDetails =
      await this.workoutDetailService.getAllLocalWorkoutDetailsByWorkoutIds(
        workoutIds
      );
    const routineDetails =
      await this.routineDetailService.getAllLocalRoutineDetailsByRoutineIds(
        routineIds
      );

    const nestedExercises = this.adapter.createNestedExercises(exercises);

    const nestedWorkouts = this.adapter.createNestedStructure(
      workouts,
      workoutDetails,
      "workoutId"
    );
    const nestedRoutines = this.adapter.createNestedStructure(
      routines,
      routineDetails,
      "routineId"
    );

    await this.api.syncAllToServer({
      userId,
      nestedExercises,
      nestedWorkouts,
      nestedRoutines,
    });
  };
}

// export const syncToServer = async (userId: string) => {
//   // 반드시 exercise
//   // => workout => routine
//   // => workoutDetail => routineDetail
//   await exerciseService.syncToServerExercises(userId);

//   await workoutService.syncToServerWorkouts(userId);
//   await routineService.syncToServerRoutines(userId);

//   await workoutDetailService.syncToServerWorkoutDetails();
//   await routineDetailService.syncToServerRoutineDetails();
// };
