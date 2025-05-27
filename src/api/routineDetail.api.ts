import { BASE_URL } from "@/constants";
import { POST_ROUTINE_DETAILS_ERROR } from "@/constants/errorMessage";
import {
  clientRoutineDetailSchema,
  LocalRoutineDetailWithServerRoutineId,
} from "@/types/models";
import { validateData } from "@/util/validateData";
import { z } from "zod";

export const syncRoutineDetailsToServerResponseSchema = z.object({
  success: z.boolean(),
  updated: z.array(
    z.object({
      localId: z.number(),
      serverId: z.string(),
      exerciseId: z.number(),
      routineId: z.string(),
    })
  ),
});

export const fetchRoutineDetailsSchema = z.object({
  success: z.boolean(),
  routineDetails: z.array(clientRoutineDetailSchema),
});

export type SyncRoutineDetailsToServerResponse = z.infer<
  typeof syncRoutineDetailsToServerResponseSchema
>;

export type FetchRoutineDetailsResponse = z.infer<
  typeof fetchRoutineDetailsSchema
>;

export const postRoutineDetailsToServer = async (
  mappedUnsynced: LocalRoutineDetailWithServerRoutineId[]
): Promise<SyncRoutineDetailsToServerResponse> => {
  console.log("dqwijhdqwoihdwqoihdwqiohdwioqhdiwoqhdioqwhdioqwh");
  const res = await fetch(`${BASE_URL}/api/routine/detail/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mappedUnsynced }),
  });
  console.log(res);

  if (!res.ok) throw new Error(POST_ROUTINE_DETAILS_ERROR);

  const data = await res.json();

  const parsedData = validateData<SyncRoutineDetailsToServerResponse>(
    syncRoutineDetailsToServerResponseSchema,
    data
  );

  return parsedData;
};
