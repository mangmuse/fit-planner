import { BASE_URL } from "@/constants";
import { db } from "@/lib/db";
import {
  PostWorkoutDetailInput,
  PostWorkoutDetailsInput,
} from "@/types/dto/workoutDetail.dto";
import {
  ClientUser,
  ClientWorkout,
  ClientWorkoutDetail,
  LocalWorkout,
} from "@/types/models";
import { getFormattedDateYMD } from "@/util/formatDate";

export type SyncWorkoutsPayload = {
  unsynced: LocalWorkout[];
};

export const fetchWorkoutFromServer = async (
  userId: string
): Promise<ClientWorkout[]> => {
  const res = await fetch(`${BASE_URL}/api/workout/${userId}`);
  console.log(res);
  if (!res.ok) throw new Error("Workout fetch에 실패했습니다");
  const data = await res.json();
  const serverWorkouts = data.workouts;
  return serverWorkouts;
};

export async function overwriteWithServerWorkouts(
  userId: string
): Promise<string[]> {
  console.log("hello");
  const serverData: ClientWorkout[] = await fetchWorkoutFromServer(userId);
  if (!serverData) throw new Error("데이터 받아오기를 실패했습니다");
  console.log(serverData);
  const workoutServerIds: string[] = [];
  const toInsert = serverData.map((workout) => {
    workoutServerIds.push(workout.id);
    return {
      id: undefined,
      userId: workout.userId,
      serverId: workout.id,
      date: getFormattedDateYMD(workout.date),
      isSynced: true,
      createdAt: workout.createdAt,
      updatedAt: workout.updatedAt,
    };
  });
  await db.workouts.clear();

  await db.workouts.bulkAdd(toInsert);
  return workoutServerIds;
}

export const syncToServerWorkouts = async () => {
  const all = await db.workouts.toArray();
  console.log(all, "all");
  const unsynced = all.filter((workout) => !workout.isSynced);
  console.log(unsynced, "uns");

  // for (const workout of all) {
  //   await db.workouts.update(workout.id!, { isSynced: false });
  // }

  const res = await fetch(`${BASE_URL}/api/workout/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unsynced }),
  });

  if (!res.ok) throw new Error("Workouts 동기화에 실패했습니다");

  const data = await res.json();
  if (data.updated) {
    for (const updated of data.updated) {
      await db.workouts.update(updated.localId, {
        serverId: updated.serverId,
        isSynced: true,
      });
    }
  }
};

export const getWorkoutDetails = async (
  userId: ClientUser["id"] | undefined,
  date: string
): Promise<ClientWorkoutDetail[]> => {
  if (!userId) {
    throw new Error("로그인을 먼저 진행해주세요");
  }
  const res = await fetch(`${BASE_URL}/api/workout/detail/${userId}/${date}`);
  if (!res.ok) {
    throw new Error("워크아웃을 불러오지 못했습니다");
  }
  const workoutDetails = await res.json();
  return workoutDetails;
};

export const postWorkoutDetails = async (
  postWorkoutDetailInput: PostWorkoutDetailsInput
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/api/workout/detail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postWorkoutDetailInput),
  });
  if (!res.ok) {
    throw new Error("워크아웃 추가에 실패했습니다");
  }
};

export const postWorkoutDetail = async (
  postWorkoutDetailInput: PostWorkoutDetailInput
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/api/workout/detail/set`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postWorkoutDetailInput),
  });
  if (!res.ok) {
    throw new Error("워크아웃 추가에 실패했습니다");
  }
};

export const deleteWorkoutDetail = async (
  workoutDetailId: ClientWorkoutDetail["id"]
): Promise<void> => {
  const res = await fetch(
    `${BASE_URL}/api/workout/detail/set/${workoutDetailId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) {
    throw new Error("워크아웃 추가에 실패했습니다");
  }
};
