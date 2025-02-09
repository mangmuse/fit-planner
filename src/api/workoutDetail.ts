import { BASE_URL } from "@/constants";
import { db } from "@/lib/db";
import { ClientWorkoutDetail, LocalWorkoutDetail } from "@/types/models";

export type SyncWorkoutDetailsPayload = {
  mappedUnsynced: (Omit<LocalWorkoutDetail, "workoutId"> & {
    workoutId: string;
  })[];
};

export const fetchWorkoutDetailsFromServer = async (userId: string) => {
  const res = await fetch(`${BASE_URL}/api/workout/detail/${userId}`);
  if (!res.ok) {
    throw new Error("서버로부터 workoutDetail fetching 을 실패했습니다");
  }
  const data = await res.json();

  const serverData: ClientWorkoutDetail[] = data.workoutDetails;
  console.log(serverData);
  return serverData;
};

export const overwriteWithServerWorkoutDetails = async (userId: string) => {
  const serverData: ClientWorkoutDetail[] = await fetchWorkoutDetailsFromServer(
    userId
  );
  console.log(serverData);
  const toInsert = await Promise.all(
    serverData.map(async (data) => {
      const exercise = await db.exercises
        .where("serverId")
        .equals(data.exerciseId)
        .first();
      const workout = await db.workouts
        .where("serverId")
        .equals(data.workoutId)
        .first();

      if (!exercise?.id || !workout?.id)
        throw new Error("exerciseId 또는 workoutId가 없습니다");
      return {
        ...data,
        id: undefined,
        serverId: data.id,
        isSynced: true,
        exerciseId: exercise?.id,
        workoutId: workout?.id,
      };
    })
  );
  console.log(toInsert);
  await db.workoutDetails.clear();
  await db.workoutDetails.bulkAdd(toInsert);
};

export const syncToServerWorkoutDetails = async () => {
  // 1. 디테일 다가져와
  const all = await db.workoutDetails.toArray();
  // 2. isSynced false인거 거르고
  const unsynced = all.filter((detail) => !detail.isSynced);
  // 3. 각각 매핑 -> exerciseId로 exercise 가져와서 serverId로 매핑,
  // 4. workoutId로 workout 가져와서 serverId로 매핑,
  const mappedUnsynced = await Promise.all(
    unsynced.map(async (detail) => {
      const exercise = await db.exercises
        .where("id")
        .equals(detail.exerciseId)
        .first();
      const workout = await db.workouts
        .where("id")
        .equals(detail.workoutId)
        .first();
      return {
        ...detail,
        exerciseId: exercise?.serverId,
        workoutId: workout?.serverId,
      };
    })
  );

  console.log(mappedUnsynced);
  // 5. route로 보내서 detail에 serverId가 있으면 업데이트 없으면 create

  const res = await fetch(`${BASE_URL}/api/workout/detail/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mappedUnsynced }),
  });

  if (!res.ok) throw new Error("WorkoutDetails 동기화에 실패했습니다");

  const data = await res.json();
  console.log(data);

  if (data.updated) {
    for (const updated of data.updated) {
      const exercise = await db.exercises
        .where("serverId")
        .equals(updated.exerciseId)
        .first();
      const workout = await db.workouts
        .where("serverId")
        .equals(updated.workoutId)
        .first();
      await db.workoutDetails.update(updated.localId, {
        serverId: updated.serverId,
        isSynced: true,
        exerciseId: exercise?.id,
        workoutId: workout?.id,
      });
    }
  }
};
