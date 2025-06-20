import { SyncExercisesToServerResponse } from "@/api/exercise.api";
import {
  ClientExercise,
  ClientRoutine,
  ClientRoutineDetail,
  ClientWorkout,
  ClientWorkoutDetail,
  LocalExercise,
  LocalRoutine,
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetailWithServerWorkoutId,
  LocalRoutineDetailWithServerRoutineId,
} from "./models";
import { SyncWorkoutsToServerResponse } from "@/api/workout.api";
import { SyncRoutinesToServerResponse } from "@/api/routine.api";
import { SyncRoutineDetailsToServerResponse } from "@/api/routineDetail.api";
import { SyncWorkoutDetailsToServerResponse } from "@/api/workoutDetail.api";

export interface IExerciseApi {
  fetchExercisesFromServer: (userId: string) => Promise<ClientExercise[]>;
  postExercisesToServer: (
    unsynced: LocalExercise[],
    userId: string
  ) => Promise<SyncExercisesToServerResponse>;
}

export interface IWorkoutApi {
  fetchWorkoutsFromServer: (userId: string) => Promise<ClientWorkout[]>;
  postWorkoutsToServer: (
    unsynced: LocalWorkout[]
  ) => Promise<SyncWorkoutsToServerResponse>;
}

export interface IRoutineApi {
  fetchRoutinesFromServer: (userId: string) => Promise<ClientRoutine[]>;
  postRoutinesToServer: (
    unsynced: LocalRoutine[]
  ) => Promise<SyncRoutinesToServerResponse>;
}

export interface IRoutineDetailApi {
  fetchRoutineDetailsFromServer: (
    userId: string
  ) => Promise<ClientRoutineDetail[]>;
  postRoutineDetailsToServer: (
    mappedUnsynced: LocalRoutineDetailWithServerRoutineId[]
  ) => Promise<SyncRoutineDetailsToServerResponse>;
}

export interface IWorkoutDetailApi {
  fetchWorkoutDetailsFromServer: (
    userId: string
  ) => Promise<ClientWorkoutDetail[]>;
  postWorkoutDetailsToServer: (
    mappedUnsynced: LocalWorkoutDetailWithServerWorkoutId[]
  ) => Promise<SyncWorkoutDetailsToServerResponse>;
}
