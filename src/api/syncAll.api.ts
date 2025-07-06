import { BASE_URL } from "@/constants";
import { ISyncAllApi } from "@/types/apis";
import {
  LocalExercise,
  LocalRoutine,
  LocalRoutineDetail,
  LocalWorkout,
  LocalWorkoutDetail,
  NestedExercise,
  Saved,
} from "@/types/models";
import { safeRequest } from "@/util/apiHelpers";
import { z } from "zod";

export type SyncAllToServerProps = {
  userId: string;
  nestedExercises: NestedExercise[];
  nestedWorkouts: (Saved<LocalWorkout> & {
    details: Saved<LocalWorkoutDetail>[];
  })[];
  nestedRoutines: (Saved<LocalRoutine> & {
    details: Saved<LocalRoutineDetail>[];
  })[];
};

export const syncAllToServerResponseSchema = z.object({
  success: z.boolean(),
});

export type SyncAllToServerResponse = z.infer<
  typeof syncAllToServerResponseSchema
>;

export class SyncAllApi implements ISyncAllApi {
  async syncAllToServer(props: SyncAllToServerProps): Promise<void> {
    await safeRequest(
      `${BASE_URL}/api/sync/all`,
      {
        method: "POST",
        body: JSON.stringify(props),
      },
      syncAllToServerResponseSchema
    );
  }
}
