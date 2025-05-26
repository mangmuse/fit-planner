import {
  fetchRoutinesFromServer,
  postRoutinesToServer,
} from "@/api/routine.api";
import { db } from "@/lib/db";
import { ClientRoutine, LocalRoutine } from "@/types/models";

type AddLocalRoutineInput = {
  userId: string;
  name: string;
  description?: string;
};

export const addLocalRoutine = async (
  addLocalRoutineInput: AddLocalRoutineInput
): Promise<number> => {
  const localId = await db.routines.add({
    ...addLocalRoutineInput,
    createdAt: new Date().toISOString(),
    isSynced: false,
    serverId: null,
    description: addLocalRoutineInput.description || "",
  });
  return localId;
};

export const getRoutineByLocalId = async (localId: number) => {
  const routine = await db.routines.where("id").equals(localId).first();
  if (!routine) throw new Error("일치하는 routine이 없습니다");
  return routine;
};

export const getAllLocalRoutines = async (userId: string) => {
  const routines = await db.routines.where("userId").equals(userId).toArray();

  return routines;
};

export const updateLocalRoutine = async (
  routine: Partial<LocalRoutine>
): Promise<void> => {
  console.log(routine, "updateLocalRoutine");
  if (!routine.id) throw new Error("routine id는 꼭 전달해주세요");
  await db.routines.update(routine.id, {
    ...routine,
    updatedAt: new Date().toISOString(),
    isSynced: false,
  });
};

export const syncToServerRoutines = async (): Promise<void> => {
  console.log("syncToServerRoutines called");

  const all = await db.routines.toArray();
  console.log("all routines to sync:", all);

  const unsynced = all.filter((routine) => !routine.isSynced);
  const data = await postRoutinesToServer(unsynced);

  if (data.updated) {
    for (const updated of data.updated) {
      await db.routines.update(updated.localId, {
        serverId: updated.serverId,
        isSynced: true,
      });
    }
  }
};

export const overwriteWithServerRoutines = async (
  userId: string
): Promise<void> => {
  const serverData: ClientRoutine[] = await fetchRoutinesFromServer(userId);
  if (!serverData) throw new Error("데이터 받아오기를 실패했습니다");
  if (serverData.length === 0) return;
  const toInsert = serverData.map((routine) => ({
    id: undefined,
    userId: routine.userId,
    serverId: routine.id,
    name: routine.name,
    description: routine.description || "",
    isSynced: true,
    createdAt: routine.createdAt,
    updatedAt: routine.updatedAt,
  }));
  await db.routines.clear();
  await db.routines.bulkAdd(toInsert);
};

// userId, description, name
