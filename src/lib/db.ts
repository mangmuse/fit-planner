import {
  LocalExercise,
  LocalWorkout,
  LocalWorkoutDetail,
} from "@/types/models";
import Dexie, { Table } from "dexie";
Dexie.debug = true;
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
