import { syncToServerExercises } from "../services/exercise.service";
import { getStartExerciseOrder } from "@/adapter/workoutDetail.adapter";
import { syncToServerWorkouts } from "../services/workout.service";
import { overwriteWithServerWorkouts } from "../services/workout.service";
import { syncToServerWorkoutDetails } from "../services/workoutDetail.service";
import { overwriteWithServerWorkoutDetails } from "../services/workoutDetail.service";
import { overwriteWithServerExercises } from "@/services/exercise.service";
import {
  LocalExercise,
  LocalWorkout,
  LocalWorkoutDetail,
} from "@/types/models";
import Dexie, { Table } from "dexie";

export class MyLocalDB extends Dexie {
  exercises!: Table<LocalExercise, number>;
  workouts!: Table<LocalWorkout, number>;
  workoutDetails!: Table<LocalWorkoutDetail, number>;
  // ↑ Table<엔티티타입, PK의 타입>

  constructor() {
    super("MyFitPlannerDB"); //
    this.version(1).stores({
      /*
      
      */
      exercises: "++id,serverId,name,category,isSynced",

      workouts: "++id,[userId+date],serverId,exerciseId,date,userId",
      workoutDetails: "++id,serverId,exerciseId,workoutId",
    });
  }
}

export const db = new MyLocalDB();

export const overWriteAllWithWerverData = async (userId: string) => {
  console.log("good");
  await overwriteWithServerExercises(userId);
  await overwriteWithServerWorkouts(userId);
  await overwriteWithServerWorkoutDetails(userId);
};

export const syncToServer = async (userId: string) => {
  await syncToServerExercises(userId);
  await syncToServerWorkouts();
  await syncToServerWorkoutDetails();
};
