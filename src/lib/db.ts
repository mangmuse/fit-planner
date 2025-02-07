import { LocalExercise } from "@/types/models";
import Dexie, { Table } from "dexie";

export class MyLocalDB extends Dexie {
  exercises!: Table<LocalExercise, number>;
  // ↑ Table<엔티티타입, PK의 타입>

  constructor() {
    super("MyFitPlannerDB"); //
    this.version(1).stores({
      /*
      
      */
      exercises: "++id,serverId,name,category",
    });
  }
}

export const db = new MyLocalDB();

export async function toggleLocalBookmark(localId: number, nextValue: boolean) {
  await db.exercises.update(localId, { isBookmarked: nextValue });
}

export async function getAllLocalExercises(): Promise<LocalExercise[]> {
  return db.exercises.toArray();
}

// export async function addLocalExercise(ex: Omit<LocalExercise, "id">) {
//   await db.exercises.add(ex);
// }
