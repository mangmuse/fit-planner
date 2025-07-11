import {
  LocalExercise,
  LocalRoutine,
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
} from "@/types/models";
import Dexie, { Table } from "dexie";

Dexie.debug = true;

export class MyLocalDB extends Dexie {
  exercises!: Table<LocalExercise, number>;
  workouts!: Table<LocalWorkout, number>;
  routines!: Table<LocalRoutine, number>;
  workoutDetails!: Table<LocalWorkoutDetail, number>;
  routineDetails!: Table<LocalRoutineDetail, number>;
  // ↑ Table<엔티티타입, PK의 타입>

  constructor() {
    super("MyFitPlannerDB"); //
    this.version(1).stores({
      exercises: "++id,serverId,name,category,isSynced,userId",

      workouts: "++id,[userId+date],serverId,exerciseId,date,userId",
      routines: "++id,serverId,exerciseId,userId",

      workoutDetails: "++id,serverId,exerciseId,workoutId",
      routineDetails: "++id,serverId,routineId,exerciseId",
    });

    // weightUnit 필드 추가
    this.version(2)
      .stores({
        exercises: "++id,serverId,name,category,isSynced,userId",
        workouts: "++id,[userId+date],serverId,exerciseId,date,userId",
        routines: "++id,serverId,exerciseId,userId",
        workoutDetails: "++id,serverId,exerciseId,workoutId",
        routineDetails: "++id,serverId,routineId,exerciseId",
      })
      .upgrade(async (trans) => {
        await trans
          .table("workoutDetails")
          .toCollection()
          .modify((detail) => {
            detail.weightUnit = "kg";
          });

        await trans
          .table("routineDetails")
          .toCollection()
          .modify((detail) => {
            detail.weightUnit = "kg";
          });
      });
  }
}

export const db = new MyLocalDB();
