import { SyncWorkoutDetailsToServerResponse } from "@/api/workoutDetail.api";
import {
  ClientWorkoutDetail,
  LocalWorkoutDetailWithServerWorkoutId,
} from "@/types/models";

export interface IWorkoutDetaeilApi {
  fetchWorkoutDetailsFromServer: (
    userId: string
  ) => Promise<ClientWorkoutDetail[]>;

  postWorkoutDetailsToServer: (
    mappedUnsynced: LocalWorkoutDetailWithServerWorkoutId[]
  ) => Promise<SyncWorkoutDetailsToServerResponse>;
}
