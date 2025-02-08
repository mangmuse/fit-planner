import {
  fetchExercisesFromServer,
  mergeServerExerciseData,
} from "@/api/exercise";
import { addLocalWorkout } from "@/lib/localWorkoutService";
import {
  AddLocalWorkoutDetailInput,
  ClientExercise,
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

export async function syncFromServer(userId: string) {
  const serverData: ClientExercise[] = await fetchExercisesFromServer(userId);
  await mergeServerExerciseData(serverData);
}

export const getstartExerciseOrder = async (
  workoutId: number
): Promise<number> => {
  const allDetails = await db.workoutDetails
    .where("workoutId")
    .equals(workoutId)
    .sortBy("exerciseOrder");
  const lastDetail = allDetails[allDetails.length - 1];
  const startOrder = lastDetail ? lastDetail.exerciseOrder + 1 : 1;
  return startOrder;
};

export async function addLocalWorkoutDetails(
  userId: string,
  date: string,
  selectedExercises: number[]
): Promise<number> {
  const workout = await addLocalWorkout(userId, date);
  const workoutId = workout.id!;
  const startOrder = await getstartExerciseOrder(workoutId);

  const newDetails: LocalWorkoutDetail[] = [];
  selectedExercises.forEach(async (exerciseId, idx) => {
    const ex = await db.exercises.get(exerciseId);
    if (!ex) throw new Error("일치하는 exercise 찾을 수 없습니다");
    const exerciseName = ex.name;
    const newDetail: LocalWorkoutDetail = {
      workoutId,
      exerciseId,
      exerciseName,
      exerciseOrder: startOrder + idx,
      setOrder: 1,
      serverId: null,
      weight: null,
      rpe: null,
      reps: null,
      isDone: false,
      isSynced: false,
      createdAt: new Date().toISOString(),
    };
    newDetails.push(newDetail);
  });
  console.log(newDetails);
  const workoutDetails = await db.workoutDetails.bulkAdd(newDetails);
  return workoutDetails;
}
