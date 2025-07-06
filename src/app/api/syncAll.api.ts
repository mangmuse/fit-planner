import { BASE_URL } from "@/constants";
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

export const syncAllToServer = async (props: SyncAllToServerProps) => {
  await safeRequest(
    `${BASE_URL}/api/sync/all`,
    {
      method: "POST",
      body: JSON.stringify(props),
    },
    syncAllToServerResponseSchema
  );
};
