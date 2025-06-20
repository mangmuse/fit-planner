import { BASE_URL } from "@/constants";
import {
  FETCH_WORKOUT_DETAILS_ERROR,
  POST_WORKOUT_DETAILS_ERROR,
} from "@/constants/errorMessage";
import { IWorkoutDetailApi } from "@/types/apis";
import {
  ClientWorkoutDetail,
  clientWorkoutDetailSchema,
  LocalWorkoutDetail,
  LocalWorkoutDetailWithServerWorkoutId,
} from "@/types/models";
import { validateData } from "@/util/validateData";
import { z } from "zod";

export const syncWorkoutDetailsToServerResponseSchema = z.object({
  success: z.boolean(),
  updated: z.array(
    z.object({
      localId: z.number(),
      serverId: z.string(),
      exerciseId: z.number(),
      workoutId: z.string(),
    })
  ),
});

export const fetchWorkoutDetailsSchema = z.object({
  success: z.boolean(),
  workoutDetails: z.array(clientWorkoutDetailSchema),
});

export type SyncWorkoutDetailsToServerResponse = z.infer<
  typeof syncWorkoutDetailsToServerResponseSchema
>;

export type SyncWorkoutDetailsPayload = {
  mappedUnsynced: (Omit<LocalWorkoutDetail, "workoutId"> & {
    workoutId: string;
  })[];
};

export type FetchWorkoutDetailsResponse = z.infer<
  typeof fetchWorkoutDetailsSchema
>;

export class WorkoutDetailApi implements IWorkoutDetailApi {
  constructor() {}

  async fetchWorkoutDetailsFromServer(
    userId: string
  ): Promise<ClientWorkoutDetail[]> {
    const res = await fetch(`${BASE_URL}/api/workout/detail/${userId}`);
    if (!res.ok) {
      throw new Error(FETCH_WORKOUT_DETAILS_ERROR);
    }
    const data = await res.json();

    const parsedData = validateData<FetchWorkoutDetailsResponse>(
      fetchWorkoutDetailsSchema,
      data
    );

    const serverWorkoutDetails = parsedData.workoutDetails;

    return serverWorkoutDetails;
  }

  async postWorkoutDetailsToServer(
    mappedUnsynced: LocalWorkoutDetailWithServerWorkoutId[]
  ): Promise<SyncWorkoutDetailsToServerResponse> {
    const res = await fetch(`${BASE_URL}/api/workout/detail/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mappedUnsynced }),
    });

    if (!res.ok) throw new Error(POST_WORKOUT_DETAILS_ERROR);

    const data = await res.json();
    const parsedData = validateData<SyncWorkoutDetailsToServerResponse>(
      syncWorkoutDetailsToServerResponseSchema,
      data
    );

    return parsedData;
  }
}
