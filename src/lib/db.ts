import { syncToServerExercises } from "../services/exercise.service";
import { getstartExerciseOrder } from "../services/workoutDetail.service";
import { syncToServerWorkouts } from "../services/workout.service";
import { overwriteWithServerWorkouts } from "../services/workout.service";
import { syncToServerWorkoutDetails } from "../services/workoutDetail.service";
import { overwriteWithServerWorkoutDetails } from "../services/workoutDetail.service";
import { overwriteWithServerExercises } from "@/services/exercise.service";
import { addLocalWorkout } from "@/services/workout.service";
import {
  AddLocalWorkoutDetailInput,
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

// export async function addLocalWorkoutDetails(
//   userId: string,
//   date: string,
//   selectedExercises: number[]
// ): Promise<number> {
//   const workout = await addLocalWorkout(userId, date);
//   const workoutId = workout.id!;
//   const startOrder = await getstartExerciseOrder(workoutId);

//   const newDetails: LocalWorkoutDetail[] = [];
//   selectedExercises.forEach(async (exerciseId, idx) => {
//     const ex = await db.exercises.get(exerciseId);
//     if (!ex) throw new Error("일치하는 exercise 찾을 수 없습니다");
//     const exerciseName = ex.name;
//     const newDetail: LocalWorkoutDetail = {
//       workoutId,
//       exerciseId,
//       exerciseName,
//       exerciseOrder: startOrder + idx,
//       setOrder: 1,
//       serverId: null,
//       weight: null,
//       rpe: null,
//       reps: null,
//       isDone: false,
//       isSynced: false,
//       createdAt: new Date().toISOString(),
//     };
//     newDetails.push(newDetail);
//   });
//   console.log(newDetails);
//   const workoutDetails = await db.workoutDetails.bulkAdd(newDetails);
//   return workoutDetails;
// }
